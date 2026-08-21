import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import { store } from "@/lib/ledger-store";
import { formatMoney, parseBulk, type Entry, type Side } from "@/lib/reconcile";

const empty = { date: "", description: "", reference: "", amount: "" };

export function EntryTable({
  side,
  title,
  entries,
}: {
  side: Side;
  title: string;
  entries: Entry[];
}) {
  const [form, setForm] = useState(empty);
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const total = entries.reduce((t, e) => t + e.amount, 0);

  const add = () => {
    if (!form.date || !form.description || !form.amount) {
      toast.error("Date, description and amount are required");
      return;
    }
    store.addEntries(side, [
      {
        date: form.date,
        description: form.description,
        reference: form.reference,
        amount: Number(form.amount) || 0,
      },
    ]);
    setForm(empty);
    toast.success("Entry added");
  };

  const importBulk = () => {
    const parsed = parseBulk(bulk);
    if (!parsed.length) {
      toast.error("No valid rows found. Use: date, description, reference, amount");
      return;
    }
    store.addEntries(side, parsed);
    setBulk("");
    setShowBulk(false);
    toast.success(`${parsed.length} entries imported`);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {formatMoney(total)}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-left font-medium">Reference</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No entries yet
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{e.date}</td>
                  <td className="px-3 py-2">{e.description}</td>
                  <td className="px-3 py-2 text-muted-foreground">{e.reference}</td>
                  <td
                    className={`whitespace-nowrap px-3 py-2 text-right tabular-nums ${
                      e.amount < 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatMoney(e.amount)}
                  </td>
                  <td className="px-1 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete entry"
                      onClick={() => store.removeEntry(side, e.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <Input
            type="date"
            value={form.date}
            onChange={(ev) => setForm({ ...form, date: ev.target.value })}
            aria-label="Date"
          />
          <Input
            placeholder="Description"
            maxLength={120}
            value={form.description}
            onChange={(ev) => setForm({ ...form, description: ev.target.value })}
            aria-label="Description"
          />
          <Input
            placeholder="Reference"
            maxLength={40}
            value={form.reference}
            onChange={(ev) => setForm({ ...form, reference: ev.target.value })}
            aria-label="Reference"
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={(ev) => setForm({ ...form, amount: ev.target.value })}
            aria-label="Amount"
          />
          <Button onClick={add} className="col-span-2 md:col-span-1">
            <Plus className="size-4" /> Add
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBulk((v) => !v)}>
            <ClipboardPaste className="size-4" /> Paste bulk
          </Button>
          <Button variant="ghost" size="sm" onClick={() => store.clear(side)}>
            Clear all
          </Button>
        </div>

        {showBulk && (
          <div className="space-y-2">
            <Textarea
              rows={5}
              value={bulk}
              onChange={(ev) => setBulk(ev.target.value)}
              maxLength={20000}
              placeholder={"2026-08-01, Client Invoice Payment, INV1042, 4500.00"}
            />
            <Button size="sm" onClick={importBulk}>
              Import rows
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
