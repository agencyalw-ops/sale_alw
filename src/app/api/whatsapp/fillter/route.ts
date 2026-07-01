/**
 * filter_csv.ts
 * Memfilter data CSV dari Google Maps Scraper
 * dan menghasilkan output JSON format sales_targets
 *
 * Penggunaan:
 *   node filter_csv.js input.csv output.json
 *   node filter_csv.js input.csv output.json --kota "Wonosobo"
 */

import fs from "fs";
import path from "path";

/* ================= TYPES ================= */
type CsvRow = Record<string, string>;

interface SalesTarget {
  nama_instansi: string;
  alamat: string;
  kota: string;
  wa_number: string;
  status: "pending";
}

interface OutputMeta {
  total: number;
  dengan_wa: number;
  tanpa_wa: number;
  kota: string;
  generated_at: string;
}

interface OutputFile {
  meta: OutputMeta;
  sales_targets: SalesTarget[];
}

// ─── Konfigurasi mapping kolom CSV ──────────────────────────────────────────
// Kolom-kolom ini sesuai dengan struktur scraper Google Maps
const COL = {
  url: "hfpxzc href",      // Link Google Maps
  nama: "qBF1Pd",          // Nama instansi / bisnis
  rating: "MW4etd",        // Rating bintang
  ulasan: "UY7F9",         // Jumlah ulasan
  kategori: "W4Efsd",      // Kategori / jenis usaha
  status_buka: "W4Efsd 2", // Status buka/tutup
  jam: "W4Efsd 3",         // Jam operasional
  alamat: "W4Efsd 4",      // Alamat
  telepon: "UsdlK",        // Nomor telepon
} as const;

// ─── Parse CSV sederhana (tanpa library eksternal) ───────────────────────────
function parseCSV(content: string): CsvRow[] {
  const lines = content.split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx].trim() : "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Format nomor WA: hapus tanda - dan spasi, pastikan awalan 62 ───────────
function formatWANumber(phone: string | undefined): string | null {
  if (!phone || phone.trim() === "") return null;

  let num = phone.replace(/[\s\-().+]/g, "");

  // Hapus karakter non-digit
  num = num.replace(/\D/g, "");

  if (num.startsWith("0")) {
    num = "62" + num.slice(1);
  } else if (!num.startsWith("62")) {
    num = "62" + num;
  }

  // Validasi panjang nomor Indonesia (10-13 digit setelah kode negara)
  if (num.length < 10 || num.length > 15) return null;

  return num;
}

// ─── Bersihkan alamat dari simbol tidak berguna ───────────────────────────────
function cleanAddress(addr: string | undefined): string {
  if (!addr) return "";
  // Hapus leading/trailing titik dan spasi
  let clean = addr.replace(/^[\s·]+|[\s·]+$/g, "").trim();
  // Hapus jika hanya kode plus (e.g. "JX2M+RJF")
  if (/^[A-Z0-9]{4}\+[A-Z0-9]{2,}/.test(clean)) return "";
  return clean;
}

// ─── Filter & transform satu row menjadi entry sales_target ─────────────────
function transformRow(row: CsvRow, defaultKota: string = "Wonosobo / Jawa Tengah"): SalesTarget | null {
  const nama = (row[COL.nama] || "").trim();

  // Skip baris tanpa nama
  if (!nama) return null;

  const rawAlamat = row[COL.alamat] || "";
  const alamat = cleanAddress(rawAlamat);

  const rawPhone = row[COL.telepon] || "";
  const waNumber = formatWANumber(rawPhone);

  return {
    nama_instansi: nama,
    alamat: alamat || "-",
    kota: defaultKota,
    wa_number: waNumber || "-",
    status: "pending",
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────
function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Penggunaan: node filter_csv.js <input.csv> [--kota \"Nama Kota\"]");
    console.error("Contoh:     node filter_csv.js google.csv --kota \"Wonosobo / Jawa Tengah\"");
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = path.join("data", "database.json");

  // Ambil kota dari argumen --kota jika ada
  let kota = "Wonosobo / Jawa Tengah";
  const kotaIdx = args.indexOf("--kota");
  if (kotaIdx !== -1 && args[kotaIdx + 1]) {
    kota = args[kotaIdx + 1];
  }

  // Buat folder data/ jika belum ada
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data", { recursive: true });
  }

  // Baca file CSV
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File tidak ditemukan: ${inputFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputFile, "utf-8");
  const rows = parseCSV(content);

  console.log(`📂 Total baris di CSV    : ${rows.length}`);

  // Transform dan filter
  const salesTargets: SalesTarget[] = rows
    .map((row) => transformRow(row, kota))
    .filter((item): item is SalesTarget => item !== null); // hapus null

  // Hapus duplikat berdasarkan nama_instansi
  const seen = new Set<string>();
  const unique = salesTargets.filter((item) => {
    const key = item.nama_instansi.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Pisahkan yang punya nomor WA dan yang tidak
  const withWA = unique.filter((i) => i.wa_number !== "-");
  const withoutWA = unique.filter((i) => i.wa_number === "-");

  console.log(`✅ Data valid (unik)      : ${unique.length}`);
  console.log(`📱 Ada nomor WA          : ${withWA.length}`);
  console.log(`❓ Tidak ada nomor WA    : ${withoutWA.length}`);

  const output: OutputFile = {
    meta: {
      total: unique.length,
      dengan_wa: withWA.length,
      tanpa_wa: withoutWA.length,
      kota: kota,
      generated_at: new Date().toISOString(),
    },
    sales_targets: unique,
  };

  // Tulis output JSON
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n💾 Output disimpan ke    : ${outputFile}`);
}

main();