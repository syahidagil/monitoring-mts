import { describe, expect, it } from "vitest";
import {
  DURASI_JP_MENIT,
  POLA_HARI,
  hitungJumlahJp,
  jamPelajaranHari,
  jamSelesaiDari,
  maksJumlahJp,
  validasiRentangJam,
  type NamaHari,
} from "./jamPelajaran";

const SEMUA_HARI = Object.keys(POLA_HARI) as NamaHari[];

function menit(jam: string) {
  const [h, m] = jam.split(":").map(Number);
  return h * 60 + m;
}

describe("jam pelajaran per hari", () => {
  it("setiap jam pelajaran berdurasi sesuai konfigurasi di semua hari", () => {
    for (const hari of SEMUA_HARI) {
      for (const jp of jamPelajaranHari(hari)) {
        expect(menit(jp.selesai) - menit(jp.mulai)).toBe(DURASI_JP_MENIT);
      }
    }
  });

  it("sesuai dokumen jadwal sekolah: Senin (8 JP, istirahat 10.10-10.30)", () => {
    const senin = jamPelajaranHari("SENIN");
    expect(senin).toHaveLength(8);
    expect(senin[0]).toEqual({ ke: 1, mulai: "07:30", selesai: "08:10" });
    expect(senin[3]).toEqual({ ke: 4, mulai: "09:30", selesai: "10:10" });
    expect(senin[4]).toEqual({ ke: 5, mulai: "10:30", selesai: "11:10" });
    expect(senin[7]).toEqual({ ke: 8, mulai: "12:30", selesai: "13:10" });
  });

  it("sesuai dokumen jadwal sekolah: Kamis dan Sabtu memiliki JP ke-9", () => {
    expect(jamPelajaranHari("KAMIS")[8]).toEqual({ ke: 9, mulai: "13:10", selesai: "13:50" });
    expect(jamPelajaranHari("SABTU")[8]).toEqual({ ke: 9, mulai: "13:10", selesai: "13:50" });
  });

  it("sesuai dokumen jadwal sekolah: Jumat (5 JP, istirahat 09.30-09.50)", () => {
    const jumat = jamPelajaranHari("JUMAT");
    expect(jumat).toHaveLength(5);
    expect(jumat[2]).toEqual({ ke: 3, mulai: "08:50", selesai: "09:30" });
    expect(jumat[3]).toEqual({ ke: 4, mulai: "09:50", selesai: "10:30" });
    expect(jumat[4]).toEqual({ ke: 5, mulai: "10:30", selesai: "11:10" });
  });

  it("JP yang sama memiliki jam berbeda di hari yang berbeda", () => {
    expect(jamPelajaranHari("SENIN")[3].mulai).toBe("09:30");
    expect(jamPelajaranHari("JUMAT")[3].mulai).toBe("09:50");
  });

  it("menerima rentang satu JP dan beberapa JP yang bersambung", () => {
    expect(validasiRentangJam("SENIN", "07:30", "08:10")).toBeNull();
    expect(validasiRentangJam("SENIN", "07:30", "09:30")).toBeNull();
    expect(validasiRentangJam("JUMAT", "09:50", "11:10")).toBeNull();
  });

  it("menolak jam di luar tabel, termasuk kegiatan pembuka 07.00", () => {
    expect(validasiRentangJam("SENIN", "07:00", "08:10")?.field).toBe("jamMulai");
    expect(validasiRentangJam("SENIN", "07:30", "08:00")?.field).toBe("jamSelesai");
  });

  it("jam yang valid di Jumat ditolak di Senin", () => {
    expect(validasiRentangJam("JUMAT", "09:50", "10:30")).toBeNull();
    expect(validasiRentangJam("SENIN", "09:50", "10:30")?.field).toBe("jamMulai");
  });

  it("menolak JP yang tidak ada pada hari itu (JP ke-6 di hari Jumat)", () => {
    expect(validasiRentangJam("JUMAT", "11:10", "11:50")?.field).toBe("jamMulai");
  });

  it("menolak jam selesai yang lebih awal dari jam mulai", () => {
    expect(validasiRentangJam("SENIN", "09:30", "08:10")?.field).toBe("jamSelesai");
  });

  it("menolak rentang yang melewati waktu istirahat", () => {
    expect(validasiRentangJam("SENIN", "09:30", "11:10")?.message).toContain("istirahat");
    expect(validasiRentangJam("JUMAT", "08:50", "10:30")?.message).toContain("istirahat");
  });

  it("menolak hari yang belum dipilih", () => {
    expect(validasiRentangJam("", "07:30", "08:10")?.message).toContain("hari");
  });

  it("jumlah JP maksimum berhenti sebelum istirahat atau akhir hari", () => {
    expect(maksJumlahJp("SENIN", 1)).toBe(4);
    expect(maksJumlahJp("SENIN", 5)).toBe(4);
    expect(maksJumlahJp("KAMIS", 5)).toBe(5);
    expect(maksJumlahJp("JUMAT", 1)).toBe(3);
    expect(maksJumlahJp("JUMAT", 4)).toBe(2);
  });

  it("jamSelesaiDari dan hitungJumlahJp saling berpasangan", () => {
    const selesai = jamSelesaiDari("SENIN", 1, 2);
    expect(selesai).toBe("08:50");
    expect(hitungJumlahJp("SENIN", "07:30", selesai as string)).toBe(2);
  });
});