import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ReportData } from "./api";
import { COMPANY } from "./reportBranding";

function fileBase(data: ReportData) {
  return (data.title || "report").replace(/[^\w]+/g, "_");
}

function hasCompare(data: ReportData) {
  return (data.series || []).some((s) => s.compareValue !== undefined);
}

// ---------------- Excel ----------------
export function exportExcel(data: ReportData) {
  const compare = hasCompare(data);
  const rows: (string | number)[][] = [];

  rows.push([COMPANY.name]);
  rows.push([COMPANY.tagline]);
  rows.push([data.title || "HR Report"]);
  rows.push([`Generated ${new Date().toLocaleString()}`]);
  rows.push([]);

  if (data.kpis && data.kpis.length) {
    rows.push(["Key figures"]);
    data.kpis.forEach((k) =>
      rows.push([k.label, `${k.value}${k.trend ? ` (${k.trend})` : ""}`]),
    );
    rows.push([]);
  }

  rows.push(["Data"]);
  rows.push(
    compare
      ? ["Group", data.period_label || "Current", data.compare_label || "Compare"]
      : ["Group", data.y_label || "Value"],
  );
  (data.series || []).forEach((s) =>
    rows.push(
      compare ? [s.label, s.value, s.compareValue ?? ""] : [s.label, s.value],
    ),
  );
  rows.push([]);

  if (data.narrative) {
    rows.push(["Summary"]);
    rows.push([data.narrative]);
    rows.push([]);
  }
  if (data.prediction) {
    rows.push(["Outlook (estimate)"]);
    rows.push([data.prediction]);
    rows.push([]);
  }
  if (data.advice && data.advice.length) {
    rows.push(["Recommended actions"]);
    data.advice.forEach((a) => rows.push([`• ${a}`]));
    rows.push([]);
  }
  rows.push([COMPANY.confidentiality]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 30 }, { wch: 24 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${fileBase(data)}.xlsx`);
}

// ---------------- PDF ----------------
export function exportPdf(data: ReportData, chartImg?: string | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 0;

  function ensure(space: number) {
    if (y + space > pageH - 70) {
      doc.addPage();
      y = 80;
    }
  }

  // Header band
  doc.setFillColor(55, 138, 221);
  doc.rect(0, 0, pageW, 64, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(COMPANY.name, margin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(COMPANY.tagline, margin, 48);
  y = 92;

  // Title + generated date
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(data.title || "HR Report", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
  y += 22;

  // KPIs
  if (data.kpis && data.kpis.length) {
    data.kpis.forEach((k) => {
      ensure(40);
      doc.setTextColor(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${k.value}${k.trend ? `   ${k.trend}` : ""}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(k.label, margin, y + 13);
      y += 34;
    });
  }

  // Chart image
  if (chartImg) {
    const imgW = pageW - margin * 2;
    const imgH = imgW * 0.5;
    ensure(imgH + 20);
    doc.addImage(chartImg, "PNG", margin, y, imgW, imgH);
    y += imgH + 20;
  }

  // Data table
  const compare = hasCompare(data);
  const head = compare
    ? [["Group", data.period_label || "Current", data.compare_label || "Compare"]]
    : [["Group", data.y_label || "Value"]];
  const body = (data.series || []).map((s) =>
    compare
      ? [s.label, String(s.value), String(s.compareValue ?? "")]
      : [s.label, String(s.value)],
  );
  autoTable(doc, {
    head,
    body,
    startY: y,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [55, 138, 221] },
    styles: { fontSize: 10 },
  });
  // @ts-expect-error lastAutoTable is added by the plugin
  y = doc.lastAutoTable.finalY + 24;

  const section = (heading: string, text: string) => {
    ensure(60);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(heading, margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 12;
  };

  if (data.narrative) section("Summary", data.narrative);
  if (data.prediction) section("Outlook (estimate)", data.prediction);
  if (data.advice && data.advice.length) {
    ensure(40);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Recommended actions", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    data.advice.forEach((a) => {
      const lines = doc.splitTextToSize(`•  ${a}`, pageW - margin * 2);
      ensure(lines.length * 14 + 4);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 4;
    });
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(margin, pageH - 44, pageW - margin, pageH - 44);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${COMPANY.name}  ·  ${COMPANY.address}`, margin, pageH - 30);
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 30, { align: "right" });
    doc.text(COMPANY.confidentiality, margin, pageH - 18);
  }

  doc.save(`${fileBase(data)}.pdf`);
}
