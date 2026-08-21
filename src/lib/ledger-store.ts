import { useSyncExternalStore } from "react";
import type { Entry, Side } from "./reconcile";

type State = {
  cashbook: Entry[];
  bank: Entry[];
  resolved: string[];
};

const seed = (
  side: Side,
  rows: [string, string, string, number][],
): Entry[] =>
  rows.map(([date, description, reference, amount], i) => ({
    id: `${side}-seed-${i}`,
    date,
    description,
    reference,
    amount,
  }));

let state: State = {
  cashbook: seed("cashbook", [
    ["2026-08-01", "Client Invoice Payment", "INV1042", 4500],
    ["2026-08-03", "Office Rent", "RENT-AUG", -1200],
    ["2026-08-05", "Stationery Purchase", "STA-118", -850],
    ["2026-08-07", "Customer Deposit", "DEP-556", 3000],
    ["2026-08-10", "Bank Charges", "FEES-08", -45],
  ]),
  bank: seed("bank", [
    ["2026-08-01", "Client Invoice Payment", "INV1042", 4500],
    ["2026-08-03", "Office Rent", "RENT-AUG", -1200],
    ["2026-08-08", "Customer Deposit", "DEP-556", 3000],
    ["2026-08-10", "Bank Charges", "FEES-08", -45],
    ["2026-08-11", "Unknown Transfer", "TRF-902", -620],
  ]),
  resolved: [],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  emit();
};

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addEntries(side: Side, entries: Omit<Entry, "id">[]) {
    const withIds = entries.map((e, i) => ({
      ...e,
      id: `${side}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    }));
    set({ [side]: [...state[side], ...withIds] } as Partial<State>);
  },
  removeEntry(side: Side, id: string) {
    set({ [side]: state[side].filter((e) => e.id !== id) } as Partial<State>);
  },
  clear(side: Side) {
    set({ [side]: [] } as Partial<State>);
  },
  toggleResolved(id: string) {
    set({
      resolved: state.resolved.includes(id)
        ? state.resolved.filter((r) => r !== id)
        : [...state.resolved, id],
    });
  },
};

export function useLedger(): State {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
