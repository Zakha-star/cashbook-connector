import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RotateCcw } from "lucide-react";
import { store, useLedger } from "@/lib/ledger-store";
import { buildSummary } from "@/lib/summary";
import { formatMoney, type MatchPair } from "@/lib/reconcile";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Matching Results — LedgerMatch" },
      {
        name: "description",
        content:
          "Review matched, possible and unmatched transactions between your cashbook and bank statement.",
      },
      { property: "og:title", content: "Matching Results — LedgerMatch" },
      {
        property: "og:description",
        content: "Matched, possible match and no match results with manual resolution.",
      },
    ],
  }),
  component: ResultsPage,
});

const tone: Record<MatchPair["status"], string> = {
  matched: "border-l-4 border-l-success bg-success-soft/50",
  possible: "border-l-4 border-l-warning bg-warning-soft/50",
  none: "border-l-4 border-l-danger bg-danger-soft/50",
};

function PairRow({ pair, resolved }: { pair: MatchPair; resolved: boolean }) {
  const e = pair.cashbook ?? pair.bank!;
  return (
    <Card className={`shadow-none ${tone[pair.status]}`}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{e.description}</span>
            <Badge variant="outline">{e.reference || "no ref"}</Badge>
            {resolved && <Badge className="bg-success text-success-foreground">Resolved</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            {e.date} · {pair.reason}
          </p>
          <p className="text-xs text-muted-foreground">
            Cashbook: {pair.cashbook ? formatMoney(pair.cashbook.amount) : "—"} · Bank:{" "}
            {pair.bank ? formatMoney(pair.bank.amount) : "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-base font-semibold tabular-nums ${
              e.amount < 0 ? "text-danger" : "text-success"
            }`}
          >
            {formatMoney(e.amount)}
          </span>
          {pair.status !== "matched" && (
            <Button
              size="sm"
              variant={resolved ? "outline" : "secondary"}
              onClick={() => store.toggleResolved(pair.id)}
            >
              {resolved ? (
                <>
                  <RotateCcw className="size-4" /> Reopen
                </>
              ) : (
                <>
                  <Check className="size-4" /> Mark resolved
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsPage() {
  const { cashbook, bank, resolved } = useLedger();
  const s = buildSummary(cashbook, bank, resolved);

  const groups = {
    matched: s.pairs.filter((p) => p.status === "matched"),
    possible: s.pairs.filter((p) => p.status === "possible"),
    none: s.pairs.filter((p) => p.status === "none"),
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Matching results</h1>
        <p className="text-sm text-muted-foreground">
          Matched on amount, reference and dates within 3 days. Amounts within R5 are flagged as
          possible matches.
        </p>
      </header>

      <Tabs defaultValue="matched">
        <TabsList className="w-full">
          <TabsTrigger value="matched" className="flex-1">
            Matched ({groups.matched.length})
          </TabsTrigger>
          <TabsTrigger value="possible" className="flex-1">
            Possible ({groups.possible.length})
          </TabsTrigger>
          <TabsTrigger value="none" className="flex-1">
            No match ({groups.none.length})
          </TabsTrigger>
        </TabsList>
        {(["matched", "possible", "none"] as const).map((key) => (
          <TabsContent key={key} value={key} className="space-y-3">
            {groups[key].length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing in this list.</p>
            ) : (
              groups[key].map((p) => (
                <PairRow key={p.id} pair={p} resolved={resolved.includes(p.id)} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
