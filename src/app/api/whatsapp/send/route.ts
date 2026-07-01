import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

/* ================= TYPES ================= */
interface ContactData {
    wa_number?: string;
    phone?: string;
    nomor?: string;
    nama_instansi?: string;
    nama?: string;
    name?: string;
    [key: string]: string | undefined;
}

interface DatabaseFile {
    sales_targets?: ContactData[];
}

/* ================= CONFIG ================= */
const DATA_DIR: string  = path.join(process.cwd(), 'data');
const DB_PATH: string   = path.join(DATA_DIR, 'database.json');
const TEXT_PATH: string = path.join(DATA_DIR, 'text.txt');
const AUTH_DIR: string  = path.join(process.cwd(), '.wwebjs_auth');
const SENT_PATH: string = path.join(DATA_DIR, 'sent.json');   // tracking terkirim
const SKIP_PATH: string = path.join(DATA_DIR, 'skip.json');   // tracking tidak ada di WA

const DELAY_ANTAR_PESAN: number = 5000; // jeda antar pesan (ms)
const MAX_RETRY: number         = 2;    // retry jika gagal kirim

/* ================= UTIL ================= */
const delay = (ms: number): Promise<void> =>
    new Promise(res => setTimeout(res, ms));

function log(icon: string, msg: string): void {
    const waktu = new Date().toLocaleTimeString('id-ID');
    console.log(`[${waktu}] ${icon}  ${msg}`);
}

/* ================= TRACKING ================= */
function loadTracking(filePath: string): Set<string> {
    try {
        if (fs.existsSync(filePath)) {
            return new Set(JSON.parse(fs.readFileSync(filePath, 'utf8')) as string[]);
        }
    } catch {
        // ignore, fall through to empty set
    }
    return new Set();
}

function saveTracking(filePath: string, set: Set<string>): void {
    fs.writeFileSync(filePath, JSON.stringify([...set], null, 2), 'utf8');
}

/* ================= LOAD DATA ================= */
function loadDatabase(): ContactData[] {
    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ database.json tidak ditemukan di folder data/');
        process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as ContactData[] | DatabaseFile;
    const list: ContactData[] = Array.isArray(raw) ? raw : (raw.sales_targets || []);
    if (!list.length) {
        console.error('❌ Database kosong!');
        process.exit(1);
    }
    log('✅', `Database dimuat — ${list.length} kontak`);
    return list;
}

function loadTemplate(): string {
    if (!fs.existsSync(TEXT_PATH)) {
        console.error('❌ text.txt tidak ditemukan di folder data/');
        process.exit(1);
    }
    const tpl = fs.readFileSync(TEXT_PATH, 'utf8').trim();
    log('✅', 'Template pesan dimuat');
    return tpl;
}

function formatPesan(template: string, data: ContactData): string {
    return template.replace(/\{(\w+)\}/g, (_match, key: string) => data[key] || '');
}

function formatNomor(raw: string): string {
    let num = String(raw).replace(/\D/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    if (!num.startsWith('62')) num = '62' + num;
    return num + '@c.us';
}

/* ================= KIRIM PESAN ================= */
async function kirimSemua(client: Client, contacts: ContactData[], template: string): Promise<void> {
    const sudahTerkirim = loadTracking(SENT_PATH);
    const nomorSkip     = loadTracking(SKIP_PATH);

    if (sudahTerkirim.size + nomorSkip.size > 0) {
        log('📋', `Tracking — Terkirim: ${sudahTerkirim.size} | Skip: ${nomorSkip.size}`);
    }

    log('🚀', `Mulai mengirim ke ${contacts.length} kontak...\n`);

    let berhasil = 0;
    let gagal    = 0;
    let tidakAda = 0;
    let diSkip   = 0;

    for (let i = 0; i < contacts.length; i++) {
        const data   = contacts[i];
        const chatId = formatNomor(data.wa_number || data.phone || data.nomor || '');
        const nomor  = chatId.replace('@c.us', '');
        const pesan  = formatPesan(template, data);
        const label  = data.nama_instansi || data.nama || data.name || nomor;
        const idx    = `[${i + 1}/${contacts.length}]`;

        // Skip nomor kosong
        if (!nomor || nomor === '62') {
            log('⚠️', `${idx} Skip — nomor kosong: ${label}`);
            gagal++;
            continue;
        }

        // Skip jika sudah terkirim sebelumnya
        if (sudahTerkirim.has(nomor)) {
            log('⏭️ ', `${idx} Skip — sudah terkirim: ${label}`);
            diSkip++;
            continue;
        }

        // Skip jika nomor diketahui tidak ada di WA
        if (nomorSkip.has(nomor)) {
            log('⏭️ ', `${idx} Skip — tidak ada di WA: ${label}`);
            diSkip++;
            continue;
        }

        // Cek apakah nomor terdaftar di WhatsApp
        try {
            const terdaftar = await client.isRegisteredUser(chatId);
            if (!terdaftar) {
                log('🚫', `${idx} Tidak terdaftar di WA → Skip: ${label}`);
                nomorSkip.add(nomor);
                saveTracking(SKIP_PATH, nomorSkip);
                tidakAda++;
                continue;
            }
        } catch {
            // Jika gagal cek, tetap coba kirim
        }

        // Kirim pesan dengan retry
        let berhasilKirim = false;
        for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                await client.sendMessage(chatId, pesan);
                berhasilKirim = true;
                break;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                if (attempt < MAX_RETRY) {
                    log('🔄', `${idx} Retry ${attempt}/${MAX_RETRY}: ${label}`);
                    await delay(2000);
                } else {
                    log('❌', `${idx} Gagal → ${label} — ${message}`);
                }
            }
        }

        if (berhasilKirim) {
            sudahTerkirim.add(nomor);
            saveTracking(SENT_PATH, sudahTerkirim);
            log('✅', `${idx} Terkirim → ${label} (${nomor})`);
            berhasil++;
        } else {
            gagal++;
        }

        if (i < contacts.length - 1) {
            log('⏱️ ', `Jeda ${DELAY_ANTAR_PESAN / 1000} detik...\n`);
            await delay(DELAY_ANTAR_PESAN);
        }
    }

    console.log('\n========================================');
    log('📊', 'Selesai!');
    log('✅', `Terkirim     : ${berhasil}`);
    log('⏭️ ', `Di-skip      : ${diSkip}`);
    log('🚫', `Tidak ada WA : ${tidakAda}`);
    log('❌', `Gagal        : ${gagal}`);
    log('📋', `Total        : ${contacts.length}`);
    console.log('========================================\n');
}

/* ================= MAIN ================= */
const contacts: ContactData[] = loadDatabase();
const template: string        = loadTemplate();

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'wa-sender',
        dataPath: AUTH_DIR
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wcore.json',
    },
    puppeteer: {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    }
});

client.on('qr', (qr: string) => {
    console.log('\n📲 Scan QR Code berikut dengan WhatsApp kamu:\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    log('🔑', 'Autentikasi berhasil!');
});

client.on('auth_failure', () => {
    console.error('❌ Autentikasi gagal. Hapus folder .wwebjs_auth lalu coba lagi.');
    process.exit(1);
});

client.on('ready', async () => {
    log('🤖', 'WhatsApp terhubung! Memulai pengiriman...\n');
    await kirimSemua(client, contacts, template);
    log('👋', 'Semua pesan sudah diproses. Bot berhenti.');
    process.exit(0);
});

client.initialize();