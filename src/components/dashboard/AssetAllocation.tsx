import { formatILS } from "@/lib/money";

interface AllocationSlice {
  label: string;
  percent: number;
  value: number;
  color: string;
}

interface AssetAllocationProps {
  slices: AllocationSlice[];
  totalAssets: number;
}

export function AssetAllocation({ slices, totalAssets }: AssetAllocationProps) {
  // Build SVG donut segments
  let offset = 0;
  const segments = slices.map((slice) => {
    const segment = { ...slice, dashArray: `${slice.percent} ${100 - slice.percent}`, dashOffset: -offset };
    offset += slice.percent;
    return segment;
  });

  return (
    <div className="card-base elev-1" style={{ padding: "28px" }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: 24 }}>
        הקצאת נכסים
      </h3>

      {/* Donut chart */}
      <div className="relative mx-auto" style={{ width: 180, height: 180, marginBottom: 28 }}>
        <svg className="w-full h-full" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span style={{ fontSize: 26, fontWeight: 800, color: "#111" }}>{totalAssets}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.4)", letterSpacing: "0.5px" }}>נכסים</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-4">
        {slices.map((slice, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: slice.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#444" }}>{slice.label} ({slice.percent}%)</span>
            </div>
            <span className="num" dir="ltr" style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
              {formatILS(slice.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
