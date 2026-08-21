import { formatMoney, type MatchPair } from "./reconcile";

const label: Record<MatchPair["status"], string> = {
  matched: "Matched",
  possible: "Possible Match",
  none: "No Match",
};

function rows(pairs: MatchPair[], resolved: string[]) {
  return pairs.map((p) => [
    label[p.status],
    p.cashbook?.date ?? p.bank?.date ?? "",
    p.cashbook?.description ?? p.bank?.description ?? "",
    p.cashbook?.reference ?? p.bank?.reference ?? "",
    p.cashbook ? formatMoney(p.cashbook.amount) : "-",
    p.bank ? formatMoney(p.bank.amount) : "-",
    resolved.includes(p.id) ? "Resolved" : p.reason,
  ]);
}

const HEAD = ["Status", "Date", "Description", "Reference", "Cashbook", "Bank", "Note"];

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(pairs: MatchPair[], resolved: string[], summary: string[][]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ["LedgerMatch Reconciliation Report"],
    [],
    ["Summary"],
    ...summary,
    [],
    HEAD,
    ...rows(pairs, resolved),
  ]
    .map((r) => r.map((c) => esc(String(c))).join(","))
    .join("\n");
  download(new Blob([lines], { type: "text/csv;charset=utf-8" }), "ledgermatch-report.csv");
}

export async function exportPdf(pairs: MatchPair[], resolved: string[], summary: string[][]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFontSize(18);
  doc.text("LedgerMatch — Reconciliation Report", marginX, y);
  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(new Date().toLocaleString(), marginX, y);
  doc.setTextColor(0);
  y += 26;

  doc.setFontSize(12);
  doc.text("Summary", marginX, y);
  y += 16;
  doc.setFontSize(10);
  for (const [k, v] of summary) {
    doc.text(`${k}: ${v}`, marginX, y);
    y += 14;
  }

  y += 12;
  doc.setFontSize(12);
  doc.text("Transactions", marginX, y);
  y += 16;

  const widths = [70, 58, 120, 65, 65, 65, 72];
  doc.setFontSize(8);
  const line = (cells: string[], bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    let x = marginX;
    cells.forEach((cell, i) => {
      doc.text(doc.splitTextToSize(String(cell), widths[i]! - 6)[0] ?? "", x, y);
      x += widths[i]!;
    });
    y += 14;
    if (y > 780) {
      doc.addPage();
      y = 50;
    }
  };
  line(HEAD, true);
  rows(pairs, resolved).forEach((r) => line(r));

  doc.save("ledgermatch-report.pdf");
}
