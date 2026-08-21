import { formatMoney, reconcile, type Entry, type MatchPair } from "./reconcile";

export type Summary = {
  pairs: MatchPair[];
  cashbookBalance: number;
  bankBalance: number;
  matchedCount: number;
  possibleCount: number;
  unmatchedCount: number;
  openItemsCount: number;
  reconciledBalance: number;
  difference: number;
};

export function buildSummary(cashbook: Entry[], bank: Entry[], resolved: string[]): Summary {
  const pairs = reconcile(cashbook, bank);
  const sum = (list: Entry[]) => list.reduce((t, e) => t + e.amount, 0);
  const cashbookBalance = sum(cashbook);
  const bankBalance = sum(bank);

  const matched = pairs.filter((p) => p.status === "matched");
  const possible = pairs.filter((p) => p.status === "possible");
  const none = pairs.filter((p) => p.status === "none");

  const unresolvedCashbookOnly = none.filter((p) => p.cashbook && !resolved.includes(p.id));
  const unresolvedBankOnly = none.filter((p) => p.bank && !p.cashbook && !resolved.includes(p.id));

  const reconciledBalance =
    bankBalance +
    unresolvedCashbookOnly.reduce((t, p) => t + (p.cashbook?.amount ?? 0), 0) -
    unresolvedBankOnly.reduce((t, p) => t + (p.bank?.amount ?? 0), 0);

  return {
    pairs,
    cashbookBalance,
    bankBalance,
    matchedCount: matched.length,
    possibleCount: possible.length,
    unmatchedCount: none.length,
    openItemsCount:
      possible.filter((p) => !resolved.includes(p.id)).length + unresolvedCashbookOnly.length + unresolvedBankOnly.length,
    reconciledBalance,
    difference: reconciledBalance - cashbookBalance,
  };
}

export function summaryRows(s: Summary): string[][] {
  return [
    ["Cashbook balance", formatMoney(s.cashbookBalance)],
    ["Bank statement balance", formatMoney(s.bankBalance)],
    ["Matched items", String(s.matchedCount)],
    ["Possible matches", String(s.possibleCount)],
    ["Unmatched items", String(s.unmatchedCount)],
    ["Open items needing review", String(s.openItemsCount)],
    ["Reconciled closing balance", formatMoney(s.reconciledBalance)],
    ["Difference vs cashbook", formatMoney(s.difference)],
  ];
}
