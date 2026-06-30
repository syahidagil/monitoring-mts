"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import type { InformasiSekolah } from "@prisma/client";

const FILTERS = ["Semua", "Akademik", "Non-Akademik", "Islami", "Nasional"];

const BADGE_COLORS: Record<string, string> = {
  Akademik: "bg-blue-100 text-blue-700",
  "Non-Akademik": "bg-yellow-100 text-yellow-700",
  Islami: "bg-green-100 text-green-700",
  Nasional: "bg-purple-100 text-purple-700",
};

export default function PrestasiSection({
  prestasi,
}: {
  prestasi: InformasiSekolah[];
}) {
  const [filter, setFilter] = useState("Semua");

  const parsed = prestasi.map((p) => {
    const [kategori, tingkat, tahun] = p.isi.split("|");
    return { ...p, kategori, tingkat, tahun };
  });

  const filtered =
    filter === "Semua" ? parsed : parsed.filter((p) => p.kategori === filter);

  return (
    <section id="prestasi" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">
            Pencapaian
          </p>
          <h2 className="text-3xl font-bold text-gray-900">Prestasi Terkini</h2>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-green-700 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.idInfo}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4 items-start"
            >
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {item.judul}
                </h3>
                <p className="text-xs text-gray-400">{item.tingkat} · {item.tahun}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${BADGE_COLORS[item.kategori] ?? "bg-gray-100 text-gray-600"}`}>
                {item.kategori}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}