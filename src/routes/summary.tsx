import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { useLedger } from "@/lib/ledger-store";
import { buildSummary, summaryRows } from "@/lib/summary";
import { exportCsv, exportPdf } from "@/lib/export-report";
import { formatMoney } from "@/lib/reconcile";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Reconciliation Summary — LedgerMatch" },
      {
        name: "description",
        content:
          "Cashbook and bank balances, matched versus unmatched counts and the reconciled closing balance.",
      },
      { property: "og:title", content: "Reconciliation Summary — LedgerMatch" },
      {
        property: "og:description",
        content: "Reconciled closing balance with PDF and CSV report export.",
      },
    ],
  }),
  component: SummaryPage,
});

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-semibold tabular-nums ${accent ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function SummaryPage() {
  const { cashbook, bank, resolved } = useLedger();
  const s = buildSummary(cashbook, bank, resolved);
  const rows = summaryRows(s);
  const balanced = Math.abs(s.difference) < 0.005;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Reconciliation summary</h1>
          <p className="text-sm text-muted-foreground">
            {balanced
              ? "Cashbook and bank reconcile with no residual difference."
              : "There is a difference remaining — review open items."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              exportCsv(s.pairs, resolved, rows);
              toast.success("CSV downloaded");
            }}
          >
            <FileDown className="size-4" /> CSV
          </Button>
          <Button
            onClick={async () => {
              await exportPdf(s.pairs, resolved, rows);
              toast.success("PDF downloaded");
            }}
          >
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cashbook balance" value={formatMoney(s.cashbookBalance)} />
        <Stat label="Bank balance" value={formatMoney(s.bankBalance)} />
        <Stat label="Matched items" value={String(s.matchedCount)} accent="text-success" />
        <Stat
          label="Unmatched / possible"
          value={`${s.unmatchedCount} / ${s.possibleCount}`}
          accent="text-danger"
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Reconciliation statement</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div
            className={`mt-4 rounded-md p-4 ${
              balanced ? "bg-success-soft" : "bg-danger-soft"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Reconciled closing balance
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(s.reconciledBalance)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
