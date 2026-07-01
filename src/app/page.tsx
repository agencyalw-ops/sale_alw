"use client";

import { useState } from "react";

type FilterResult = {
  total: number;
  ready: number;
  sent: number;
  skip: number;
  invalid: number;
  contacts: any[];
};

export default function WhatsAppPage() {
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);

  const [status, setStatus] = useState("Disconnected");

  const [result, setResult] = useState<FilterResult>({
    total: 0,
    ready: 0,
    sent: 0,
    skip: 0,
    invalid: 0,
    contacts: [],
  });

  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (text: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${text}`,
      ...prev,
    ]);
  };

  async function handleFilter() {
    try {
      setLoadingFilter(true);

      addLog("Memulai filter kontak...");

      const res = await fetch("/api/whatsapp/filter", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Filter gagal");
      }

      setResult(data);

      addLog(`Filter selesai. ${data.ready} kontak siap dikirim.`);
    } catch (err: any) {
      addLog(err.message);
      alert(err.message);
    } finally {
      setLoadingFilter(false);
    }
  }

  async function handleSend() {
    try {
      setLoadingSend(true);

      addLog("Memulai pengiriman...");

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts: result.contacts,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Pengiriman gagal");
      }

      setProgress({
        total: data.total,
        sent: data.sent,
        failed: data.failed,
      });

      addLog("Pengiriman selesai.");
    } catch (err: any) {
      addLog(err.message);
      alert(err.message);
    } finally {
      setLoadingSend(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          WhatsApp Broadcast
        </h1>

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Status</p>

            <p
              className={`mt-2 text-xl font-bold ${
                status === "Connected"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {status}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Total Database</p>

            <p className="mt-2 text-3xl font-bold">
              {result.total}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Siap Dikirim</p>

            <p className="mt-2 text-3xl text-green-600 font-bold">
              {result.ready}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Skip</p>

            <p className="mt-2 text-3xl text-yellow-500 font-bold">
              {result.skip}
            </p>
          </div>

        </div>

        <div className="flex gap-4 mb-8">

          <button
            onClick={handleFilter}
            disabled={loadingFilter}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            {loadingFilter
              ? "Filtering..."
              : "Filter Kontak"}
          </button>

          <button
            onClick={handleSend}
            disabled={loadingSend || result.ready === 0}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            {loadingSend
              ? "Mengirim..."
              : "Kirim Pesan"}
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="font-bold text-xl mb-4">
              Statistik
            </h2>

            <div className="space-y-3">

              <div className="flex justify-between">
                <span>Total</span>
                <b>{result.total}</b>
              </div>

              <div className="flex justify-between">
                <span>Ready</span>
                <b>{result.ready}</b>
              </div>

              <div className="flex justify-between">
                <span>Sudah Terkirim</span>
                <b>{result.sent}</b>
              </div>

              <div className="flex justify-between">
                <span>Skip</span>
                <b>{result.skip}</b>
              </div>

              <div className="flex justify-between">
                <span>Tidak Ada WA</span>
                <b>{result.invalid}</b>
              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="font-bold text-xl mb-4">
              Progress Pengiriman
            </h2>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-green-600 h-4 rounded-full transition-all"
                style={{
                  width:
                    progress.total === 0
                      ? "0%"
                      : `${
                          (progress.sent /
                            progress.total) *
                          100
                        }%`,
                }}
              />

            </div>

            <div className="mt-4 space-y-2">

              <div className="flex justify-between">
                <span>Terkirim</span>
                <b>{progress.sent}</b>
              </div>

              <div className="flex justify-between">
                <span>Gagal</span>
                <b>{progress.failed}</b>
              </div>

              <div className="flex justify-between">
                <span>Total</span>
                <b>{progress.total}</b>
              </div>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-xl font-bold mb-4">
            Log Aktivitas
          </h2>

          <div className="h-96 overflow-auto border rounded-lg bg-black text-green-400 p-4 font-mono text-sm">

            {logs.length === 0 && (
              <p>Belum ada aktivitas...</p>
            )}

            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}

          </div>

        </div>

      </div>
    </main>
  );
}