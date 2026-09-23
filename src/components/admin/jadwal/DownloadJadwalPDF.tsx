"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { drawKopSurat } from "@/lib/pdf/kopSurat";
import { getJadwalUntukCetak } from "@/actions/jadwal.action";

const HARI_ORDER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const HARI_LABEL: Record<string, string> = {
  SENIN: "SENIN", SELASA: "SELASA", RABU: "RABU", KAMIS: "KAMIS", JUMAT: "JUM'AT", SABTU: "SABTU",
};

type Props = {
  tahunAjaranAktif?: { nama: string; semester: string };
};

function toMenit(jam: string) {
  const [h, m] = jam.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function DownloadJadwalPDF({ tahunAjaranAktif }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const jadwal = await getJadwalUntukCetak({});

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 10;

      // ── KOP SURAT ──────────────────────────────────────────────────────────
      await drawKopSurat(doc, pageW, margin);

      // ── JUDUL DOKUMEN ──────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(27, 94, 32);
      const judul = `JADWAL PELAJARAN SEMESTER ${tahunAjaranAktif?.semester === "GENAP" ? "GENAP" : "GANJIL"} TAHUN PELAJARAN ${tahunAjaranAktif?.nama ?? "-"}`;
      doc.text(judul, pageW / 2, 50, { align: "center" });

      // ── SUSUN DAFTAR KELAS (kolom) ────────────────────────────────────────
      // Urut berdasarkan tingkat lalu nama kelas, hanya kelas yang benar-benar
      // punya jadwal yang dimasukkan sebagai kolom.
      type KelasInfo = { kelasId: number; nama: string; tingkat: number };
      const kelasMapAwal = new Map<number, KelasInfo>();
      jadwal.forEach((j) => {
        if (!kelasMapAwal.has(j.kelasId)) {
          kelasMapAwal.set(j.kelasId, { kelasId: j.kelasId, nama: j.kelas.nama, tingkat: j.kelas.tingkat });
        }
      });
      const daftarKelas = Array.from(kelasMapAwal.values()).sort(
        (a, b) => a.tingkat - b.tingkat || a.nama.localeCompare(b.nama)
      );

      // ── SUSUN DATA PER HARI → PER SLOT WAKTU → PER KELAS ────────────────────
      type Cell = { mapel: string; kodeGuru: string; guruNama: string } | null;
      type SlotRow = { jamMulai: string; jamSelesai: string; cells: Record<number, Cell> };

      const hariAda = HARI_ORDER.filter((h) => jadwal.some((j) => j.hari === h));
      const dataPerHari = new Map<string, SlotRow[]>();

      hariAda.forEach((hari) => {
        const jadwalHariIni = jadwal.filter((j) => j.hari === hari);
        const slots: SlotRow[] = [];
        jadwalHariIni.forEach((j) => {
          let slot = slots.find((s) => s.jamMulai === j.jamMulai && s.jamSelesai === j.jamSelesai);
          if (!slot) {
            slot = { jamMulai: j.jamMulai, jamSelesai: j.jamSelesai, cells: {} };
            slots.push(slot);
          }
          slot.cells[j.kelasId] = {
            mapel: j.mataPelajaran?.namaMapel ?? j.kodeMapel ?? "-",
            kodeGuru: j.guru?.kodeGuru ?? "-",
            guruNama: j.guru?.user?.name ?? "-",
          };
        });
        slots.sort((a, b) => toMenit(a.jamMulai) - toMenit(b.jamMulai));
        dataPerHari.set(hari, slots);
      });

      // Kumpulkan legenda guru (kode -> nama), dari semua jadwal yang tampil.
      const legendaGuru = new Map<string, string>();
      jadwal.forEach((j) => {
        const kode = j.guru?.kodeGuru;
        if (kode) legendaGuru.set(kode, j.guru?.user?.name ?? "-");
      });
      const legendaList = Array.from(legendaGuru.entries()).sort((a, b) => {
        const na = Number(a[0]), nb = Number(b[0]);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a[0].localeCompare(b[0]);
      });

      // ── BANGUN HEAD (3 baris) ─────────────────────────────────────────────
      const head = [
        [
          { content: "HARI", rowSpan: 3, styles: { valign: "middle", halign: "center" } },
          { content: "JAM KE", rowSpan: 3, styles: { valign: "middle", halign: "center" } },
          { content: "WAKTU", rowSpan: 3, styles: { valign: "middle", halign: "center" } },
          { content: "KELAS", colSpan: daftarKelas.length * 2, styles: { halign: "center" } },
        ],
        daftarKelas.map((k) => ({
          content: `Kelas ${k.nama}`,
          colSpan: 2,
          styles: { halign: "center", fillColor: [255, 235, 59], textColor: [40, 40, 40] },
        })),
        daftarKelas.flatMap(() => ([
          { content: "MATA PELAJARAN", styles: { halign: "center", fontSize: 6.5 } },
          { content: "KODE GURU", styles: { halign: "center", fontSize: 6.5 } },
        ])),
      ];

      // ── BANGUN BODY ────────────────────────────────────────────────────────
      const body: any[] = [];
      let jamKeCounter = 0;

      hariAda.forEach((hari) => {
        const slots = dataPerHari.get(hari) ?? [];
        jamKeCounter = 0;

        slots.forEach((slot, idx) => {
          // Cek apakah baris ini "seragam" di semua kelas (mapel + guru sama persis)
          // untuk semua kelas yang punya entri di slot ini.
          const entriKelas = daftarKelas.map((k) => slot.cells[k.kelasId]).filter(Boolean) as NonNullable<Cell>[];
          const semuaKelasTerisi = entriKelas.length === daftarKelas.length;
          const kunciUnik = new Set(entriKelas.map((e) => `${e.mapel}__${e.kodeGuru}`));
          const isSeragam = semuaKelasTerisi && kunciUnik.size === 1;

          const row: any[] = [];
          if (idx === 0) {
            row.push({
              content: HARI_LABEL[hari],
              rowSpan: slots.length,
              styles: { valign: "middle", halign: "center", fontStyle: "bold", fillColor: [235, 235, 235] },
            });
          }

          if (isSeragam) {
            // Baris khusus (Upacara, Istirahat, dsb) — melebar tanpa Jam Ke & tanpa kode guru.
            row.push({ content: "", styles: {} });
            row.push({ content: `${slot.jamMulai}\u2013${slot.jamSelesai}`, styles: { halign: "center", fontSize: 7 } });
            row.push({
              content: entriKelas[0].mapel.toUpperCase(),
              colSpan: daftarKelas.length * 2,
              styles: { halign: "center", fontStyle: "bold", fillColor: [225, 225, 225] },
            });
          } else {
            jamKeCounter += 1;
            row.push({ content: String(jamKeCounter), styles: { halign: "center", fontSize: 7 } });
            row.push({ content: `${slot.jamMulai}\u2013${slot.jamSelesai}`, styles: { halign: "center", fontSize: 7 } });
            daftarKelas.forEach((k) => {
              const cell = slot.cells[k.kelasId];
              row.push({ content: cell?.mapel ?? "", styles: { halign: "center", fontSize: 7 } });
              row.push({ content: cell?.kodeGuru ?? "", styles: { halign: "center", fontSize: 7 } });
            });
          }
          body.push(row);
        });
      });

      // ── TABEL JADWAL ───────────────────────────────────────────────────────
      autoTable(doc, {
        startY: 55,
        head: head as any,
        body,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 7,
          cellPadding: { top: 1.8, right: 1.5, bottom: 1.8, left: 1.5 },
          textColor: [30, 30, 30],
          valign: "middle",
          halign: "center",
          lineColor: [170, 170, 170],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [27, 94, 32],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 7.5,
        },
        columnStyles: {
          0: { cellWidth: 9 },
          1: { cellWidth: 12 },
          2: { cellWidth: 20 },
        },
        rowPageBreak: "avoid",
      });

      // ── LEGENDA NAMA GURU ──────────────────────────────────────────────────
      const finalY = (doc as any).lastAutoTable.finalY + 8;
      let legendaStartY = finalY;
      if (legendaStartY > pageH - 40) {
        doc.addPage();
        legendaStartY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(27, 94, 32);
      doc.text("KETERANGAN KODE GURU", margin, legendaStartY);

      const tengah = Math.ceil(legendaList.length / 2);
      const kolomKiri = legendaList.slice(0, tengah);
      const kolomKanan = legendaList.slice(tengah);
      const maxBaris = Math.max(kolomKiri.length, kolomKanan.length);
      const legendaBody: any[] = [];
      for (let i = 0; i < maxBaris; i++) {
        legendaBody.push([
          kolomKiri[i] ? kolomKiri[i][0] : "",
          kolomKiri[i] ? kolomKiri[i][1] : "",
          kolomKanan[i] ? kolomKanan[i][0] : "",
          kolomKanan[i] ? kolomKanan[i][1] : "",
        ]);
      }

      autoTable(doc, {
        startY: legendaStartY + 3,
        head: [["Kode", "Nama Guru", "Kode", "Nama Guru"]],
        body: legendaBody,
        margin: { left: margin, right: margin },
        tableWidth: pageW - margin * 2,
        styles: { fontSize: 8, cellPadding: 2, textColor: [40, 40, 40] },
        headStyles: { fillColor: [27, 94, 32], textColor: 255, fontStyle: "bold", fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: (pageW - margin * 2) / 2 - 15 },
          2: { cellWidth: 15, halign: "center" },
          3: { cellWidth: (pageW - margin * 2) / 2 - 15 },
        },
      });

      // ── FOOTER (semua halaman) ────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(margin, pageH - 10, pageW - margin, pageH - 10);
        doc.setFontSize(7);
        doc.setTextColor(160);
        doc.text("Dicetak oleh Sistem Monitoring MTS Al-Amin Bintaro", pageW / 2, pageH - 6, { align: "center" });
      }

      // ── SIMPAN ─────────────────────────────────────────────────────────────
      const namaFile = `Jadwal_Pelajaran_${tahunAjaranAktif?.nama.replace(/\//g, "-") ?? "semester"}.pdf`;
      doc.save(namaFile);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat PDF...</>
        : <><Download className="w-4 h-4" /> Download PDF</>}
    </button>
  );
}
