export type Side = "cashbook" | "bank";

export type Entry = {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
};

export type MatchStatus = "matched" | "possible" | "none";

export type MatchPair = {
  id: string;
  status: MatchStatus;
  cashbook?: Entry;
  bank?: Entry;
  reason: string;
};

export const AMOUNT_TOLERANCE = 5;
export const DATE_TOLERANCE_DAYS = 3;

export function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return Number.POSITIVE_INFINITY;
  return Math.abs(da - db) / 86_400_000;
}

const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, "");

export function formatMoney(value: number): string {
  return `${value < 0 ? "-" : ""}R${Math.abs(value).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function reconcile(cashbook: Entry[], bank: Entry[]): MatchPair[] {
  const usedBank = new Set<string>();
  const pairs: MatchPair[] = [];

  // Pass 1 — exact matches: same amount, same reference, dates within tolerance.
  for (const c of cashbook) {
    const hit = bank.find(
      (b) =>
        !usedBank.has(b.id) &&
        Math.abs(b.amount - c.amount) < 0.005 &&
        norm(b.reference) === norm(c.reference) &&
        daysBetween(b.date, c.date) <= DATE_TOLERANCE_DAYS,
    );
    if (hit) {
      usedBank.add(hit.id);
      const sameDay = daysBetween(hit.date, c.date) === 0;
      pairs.push({
        id: `${c.id}|${hit.id}`,
        status: "matched",
        cashbook: c,
        bank: hit,
        reason: sameDay
          ? "Exact match on amount, reference and date"
          : `Amount and reference match, dates differ by ${daysBetween(hit.date, c.date)} day(s)`,
      });
    }
  }

  const matchedCashbook = new Set(pairs.map((p) => p.cashbook!.id));

  // Pass 2 — possible matches: tolerance on amount, or amount match with ref/date drift.
  for (const c of cashbook) {
    if (matchedCashbook.has(c.id)) continue;
    let best: { entry: Entry; reason: string } | null = null;
    for (const b of bank) {
      if (usedBank.has(b.id)) continue;
      const diff = Math.abs(b.amount - c.amount);
      const dateGap = daysBetween(b.date, c.date);
      const sameRef = norm(b.reference) === norm(c.reference);
      const reasons: string[] = [];
      if (diff < 0.005 && sameRef) reasons.push(`Dates differ by ${dateGap} day(s)`);
      else if (diff < 0.005 && !sameRef) reasons.push("Amount matches but reference differs");
      else if (diff <= AMOUNT_TOLERANCE && (sameRef || dateGap <= DATE_TOLERANCE_DAYS))
        reasons.push(`Amount differs by ${formatMoney(diff)}`);
      else continue;
      if (!sameRef && !reasons.some((r) => r.includes("reference")))
        reasons.push("Reference differs");
      best = { entry: b, reason: reasons.join(" · ") };
      break;
    }
    if (best) {
      usedBank.add(best.entry.id);
      matchedCashbook.add(c.id);
      pairs.push({
        id: `${c.id}|${best.entry.id}`,
        status: "possible",
        cashbook: c,
        bank: best.entry,
        reason: best.reason,
      });
    }
  }

  // Pass 3 — unmatched on both sides.
  for (const c of cashbook) {
    if (matchedCashbook.has(c.id)) continue;
    pairs.push({
      id: c.id,
      status: "none",
      cashbook: c,
      reason: "No corresponding bank statement entry",
    });
  }
  for (const b of bank) {
    if (usedBank.has(b.id)) continue;
    pairs.push({
      id: b.id,
      status: "none",
      bank: b,
      reason: "No corresponding cashbook entry",
    });
  }

  return pairs;
}

export function parseBulk(text: string): Omit<Entry, "id">[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\t|,(?![^"]*"\s*$)/).map((c) => c.trim().replace(/^"|"$/g, "")))
    .filter((cells) => cells.length >= 4 && !/^date$/i.test(cells[0] ?? ""))
    .map((cells) => ({
      date: cells[0] ?? "",
      description: cells[1] ?? "",
      reference: cells[2] ?? "",
      amount: Number((cells[3] ?? "0").replace(/[^0-9.-]/g, "")) || 0,
    }));
}
