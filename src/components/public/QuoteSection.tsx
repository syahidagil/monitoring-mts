"use client";
import { useState } from "react";
const QUOTES = [
  { text: "Menuntut ilmu adalah kewajiban bagi setiap muslim.", source: "HR. Ibnu Majah" },
  { text: "Barangsiapa menempuh jalan mencari ilmu, Allah mudahkan jalannya ke surga.", source: "HR. Muslim" },
  { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.", source: "HR. Ahmad" },
];
export default function QuoteSection() {
  const [active, setActive] = useState(0);
  return (
    <section className="py-20 bg-[#1B5E20]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-[#4CAF50] font-serif text-7xl leading-none mb-4" style={{ fontFamily: "Georgia, serif" }}>99</p>
        <p className="text-white text-2xl sm:text-3xl font-semibold leading-relaxed mb-6">
          &quot;{QUOTES[active].text}&quot;
        </p>
        <p className="text-green-300 text-sm">&#8212; {QUOTES[active].source} &#8212;</p>
        <div className="flex justify-center gap-2 mt-10">
          {QUOTES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${active === i ? "w-8 bg-[#4CAF50]" : "w-2 bg-green-700 hover:bg-green-600"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
