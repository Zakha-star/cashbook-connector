# LedgerMatch: Easy Reconciliation

Create a web application called LedgerMatch — a bank reconciliation assistant for accounting trainees and small business bookkeepers.

Core purpose: Users enter or paste in cashbook transactions and bank statement transactions, and the app automatically matches them, flags unmatched items, and produces a clean reconciliation report.

Features:

Two input tables: "Cashbook Entries" and "Bank Statement Entries" (columns: date, description, reference, amount)

Users can add entries manually one at a time, or paste in bulk (CSV-style, comma or tab separated)

Auto-matching logic:

Matched — identical amount, same reference, and identical or close dates (within 3 days)

Possible Match — close amount within a small tolerance (e.g. within R5), OR a date/reference mismatch flagged for manual review

No Match — no corresponding entry found in the other record

Results view with three tabs: Matched, Possible Match, and No Match

A summary panel showing: total cashbook balance, total bank balance, number of matched vs unmatched items, and the reconciled closing balance

Ability to manually mark an unmatched item as resolved

Export options: download the reconciliation report as PDF and as CSV

Design requirements:

Clean, professional interface suited to a finance audience

Mobile-friendly and responsive

Simple navigation between "Input," "Matching Results," and "Summary" views

Calm, finance-appropriate color palette: navy, white, soft green for matched items, soft red for unmatched items

Pre-load the app with this sample data so I can test it immediately:

Cashbook Entries:

2026-08-01, Client Invoice Payment, INV1042, 4500.00

2026-08-03, Office Rent, RENT-AUG, -1200.00

2026-08-05, Stationery Purchase, STA-118, -850.00

2026-08-07, Customer Deposit, DEP-556, 3000.00

2026-08-10, Bank Charges, FEES-08, -45.00

Bank Statement Entries:

2026-08-01, Client Invoice Payment, INV1042, 4500.00

2026-08-03, Office Rent, RENT-AUG, -1200.00

2026-08-08, Customer Deposit, DEP-556, 3000.00

2026-08-10, Bank Charges, FEES-08, -45.00

2026-08-11, Unknown Transfer, TRF-902, -620.00

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cashbook-connector.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/932027d4-f8a9-4abd-bb38-8283eca39c0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
