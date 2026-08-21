import { createFileRoute, Link } from "@tanstack/react-router";
import { EntryTable } from "@/components/EntryTable";
import { Button } from "@/components/ui/button";
import { useLedger } from "@/lib/ledger-store";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LedgerMatch — Bank Reconciliation Assistant" },
      {
        name: "description",
        content:
          "Enter or paste cashbook and bank statement transactions and let LedgerMatch match them automatically.",
      },
      { property: "og:title", content: "LedgerMatch — Bank Reconciliation Assistant" },
      {
        property: "og:description",
        content: "Match cashbook and bank statement entries, flag exceptions and export a report.",
      },
    ],
  }),
  component: InputPage,
});

function InputPage() {
  const { cashbook, bank } = useLedger();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Transaction input</h1>
        <p className="text-sm text-muted-foreground">
          Add entries one at a time or paste rows as{" "}
          <span className="font-medium">date, description, reference, amount</span> (comma or tab
          separated).
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <EntryTable side="cashbook" title="Cashbook Entries" entries={cashbook} />
        <EntryTable side="bank" title="Bank Statement Entries" entries={bank} />
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/results">
            Run matching <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
