"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import type { InformasiSekolah } from "@prisma/client";

export default function KurikulumSection({
  kurikulum,
}: {
  kurikulum: InformasiSekolah[];
}) {
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="kurikulum" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold tracking-widest uppercase mb-2">
            Program Belajar
          </p>
          <h2 className="text-3xl font-bold text-gray-900">Kurikulum</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {kurikulum.map((item, i) => (
            <button
              key={item.idInfo}
              onClick={() => { setActive(i); setOpenIdx(null); }}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                active === i
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.judul}
            </button>
          ))}
        </div>

        {/* Accordion Content */}
        {kurikulum[active] && (
          <div className="grid sm:grid-cols-2 gap-3">
            {kurikulum[active].isi.split("|").map((item, i) => (
              <button
                key={i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex items-center justify-between bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-xl px-5 py-4 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}