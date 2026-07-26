"use client";

type Titik = { label: string; jumlah: number };

export default function LineChartMini({ data }: { data: Titik[] }) {
  const W = 700, H = 200, pad = 30;
  const maks = Math.max(1, ...data.map((d) => d.jumlah));
  const stepX = data.length > 1 ? (W - pad * 2) / (data.length - 1) : 0;

  const pts = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = H - pad - (d.jumlah / maks) * (H - pad * 2);
    return { x, y, ...d };
  });

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1]?.x ?? pad} ${H - pad} L ${pts[0]?.x ?? pad} ${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B5E20" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1B5E20" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hafGrad)" />
      <path d={path} fill="none" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#1B5E20" />
          <text x={p.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#9ca3af">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}