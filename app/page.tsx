"use client";

import { Suspense } from "react";
import { TokenProvider } from "@/lib/token-context";
import { SalesInvoiceTable } from "@/components/sales-invoice-table";
import { TokenInput } from "@/components/token-input";

function PageContent() {
  return (
    <TokenProvider>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              QNE Sales Invoices
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your sales invoices from QNE Cloud
            </p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <SalesInvoiceTable />
            <aside>
              <TokenInput />
            </aside>
          </div>
        </div>
      </main>
    </TokenProvider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
