import { useRef } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportData } from "../api";
import { exportExcel, exportPdf } from "../exportReport";

const COLORS = ["#2563eb", "#60a5fa", "#3b82f6", "#93c5fd", "#1d4ed8", "#bfdbfe"];
// Distinct multi-hue palette for pie slices (bars stay on the blue theme).
const PIE_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function Chart({ data }: { data: ReportData }) {
  const series = data.series || [];
  const unit = data.unit ?? "%";
  const hasCompare = series.some((s) => s.compareValue !== undefined);
  const nameCurrent = data.period_label || "Current";
  const nameCompare = data.compare_label || "Compare";

  if (data.chart_type === "line") {
    return (
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} unit={unit} />
        <Tooltip />
        {hasCompare && <Legend />}
        <Line type="monotone" dataKey="value" name={nameCurrent} stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        {hasCompare && (
          <Line type="monotone" dataKey="compareValue" name={nameCompare} stroke="#93c5fd" strokeWidth={2} dot={{ r: 3 }} />
        )}
      </LineChart>
    );
  }

  if (data.chart_type === "pie") {
    return (
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={series} dataKey="value" nameKey="label" outerRadius={90} label>
          {series.map((s, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return (
    <BarChart data={series} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} unit={unit} />
      <Tooltip />
      {hasCompare ? (
        <>
          <Legend />
          <Bar dataKey="value" name={nameCurrent} fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="compareValue" name={nameCompare} fill="#93c5fd" radius={[4, 4, 0, 0]} />
        </>
      ) : (
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {series.map((s, i) => (
            <Cell key={i} fill={s.highlight ? "#1d4ed8" : "#2563eb"} />
          ))}
        </Bar>
      )}
    </BarChart>
  );
}

export default function ReportCard({ data }: { data: ReportData }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const series = data.series || [];
  const hasSeries = series.length > 0;
  const showChart = hasSeries && data.chart_type !== "kpi_number";
  const compare = series.some((s) => s.compareValue !== undefined);
  const unit = data.unit ?? "";

  async function handlePdf() {
    let img: string | null = null;
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
        });
        img = canvas.toDataURL("image/png");
      } catch (e) {
        console.error("chart capture failed", e);
      }
    }
    exportPdf(data, img);
  }

  const btn =
    "flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";

  return (
    <section>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-blue-600">
        Current report · sample workforce
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-lg font-medium text-slate-900">{data.title}</h2>
        <div className="flex shrink-0 gap-2">
          <button onClick={handlePdf} className={btn}>
            <Download size={13} /> Download PDF
          </button>
          <button onClick={() => exportExcel(data)} className={btn}>
            <Download size={13} /> Download Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Workforce visualisation</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-600">
              {data.badge || "Sample data"}
            </span>
          </div>

          {data.kpis && data.kpis.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-6">
              {data.kpis.map((k, i) => (
                <div key={i}>
                  <div className="text-[11px] text-slate-500">{k.label}</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {k.value}
                    {k.trend && (
                      <span className="ml-1 text-xs font-normal text-slate-400">{k.trend}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showChart && (
            <div ref={chartRef} className="h-64 w-full bg-white">
              <ResponsiveContainer width="100%" height="100%">
                <Chart data={data} />
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* At a glance */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 text-sm font-medium text-slate-900">At a glance</div>
          {data.narrative && <p className="text-sm text-slate-600">{data.narrative}</p>}
          {data.prediction && (
            <p className="mt-3 text-sm text-slate-600">{data.prediction}</p>
          )}
          <div className="mt-4 border-t border-blue-100 pt-3">
            <div className="text-xs font-medium text-slate-500">About this report</div>
            <p className="mt-1 text-xs text-slate-500">
              Figures are computed from illustrative HR data. No live HR records are
              connected. Review before use.
            </p>
          </div>
        </div>
      </div>

      {/* Report figures */}
      {hasSeries && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-slate-900">Report figures</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-2 font-medium">Group</th>
                <th className="pb-2 text-right font-medium">
                  {compare ? data.period_label || "Current" : data.y_label || "Value"}
                </th>
                {compare && (
                  <th className="pb-2 text-right font-medium">
                    {data.compare_label || "Compare"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {series.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-700">{s.label}</td>
                  <td className="py-2 text-right font-medium text-slate-900">
                    {s.value}
                    {unit}
                  </td>
                  {compare && (
                    <td className="py-2 text-right text-slate-600">
                      {s.compareValue}
                      {unit}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommended actions */}
      {data.advice && data.advice.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-900">Recommended actions</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {data.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
