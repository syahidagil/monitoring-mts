"use client";
import { useEffect, useRef, useState } from "react";
import { Users, GraduationCap, Award, BookOpen } from "lucide-react";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 30);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { icon: Users, label: "SISWA", value: 500, suffix: "+" },
  { icon: GraduationCap, label: "GURU", value: 40, suffix: "+" },
  { icon: Award, label: "PRESTASI", value: 100, suffix: "+" },
  { icon: BookOpen, label: "ESKUL", value: 12, suffix: "" },
];

export default function StatistikSection({ statistik }: { statistik?: any }) {
  const values = statistik?.isi?.split("|").map(Number) ?? [500, 40, 100, 12];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">MTS Al-Amin Bintaro Dalam Angka</h2>
          <div className="w-12 h-1 bg-[#1B5E20] mx-auto mt-3 rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, label, value, suffix }, i) => (
            <div key={label} className="border border-gray-200 rounded-xl p-8 text-center hover:shadow-md transition-shadow">
              <Icon className="w-8 h-8 text-[#2E7D32] mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-4xl font-bold text-gray-900 mb-2">
                <CountUp target={values[i] ?? value} suffix={suffix} />
              </p>
              <p className="text-xs font-semibold text-gray-500 tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
