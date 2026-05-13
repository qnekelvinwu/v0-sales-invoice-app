"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SalesInvoiceTable } from "@/components/sales-invoice-table";
import { SalesRevenueDashboard } from "@/components/sales-revenue-dashboard";
import { AppHeader } from "@/components/app-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Table2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mainTab, setMainTab] = useState("dashboard");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sales Invoices
          </h1>
          <p className="mt-2 text-muted-foreground">
            Revenue insights and invoice list from QNE Cloud
          </p>
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="size-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <Table2 className="size-4" />
              Invoices
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-0 outline-none">
            {mainTab === "dashboard" ? <SalesRevenueDashboard /> : null}
          </TabsContent>
          <TabsContent value="invoices" className="mt-0 outline-none">
            {mainTab === "invoices" ? <SalesInvoiceTable /> : null}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
