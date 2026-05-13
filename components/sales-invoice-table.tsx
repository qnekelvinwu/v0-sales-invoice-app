"use client";

import { useState } from "react";
import { useSalesInvoices } from "@/hooks/use-sales-invoices";
import { useAuth } from "@/lib/auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  FileText,
} from "lucide-react";

const PAGE_SIZE = 20;

export function SalesInvoiceTable() {
  const { token, isLoading: tokenLoading } = useAuth();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");

  const { invoices, totalCount, isLoading, isError, errorMessage, refresh } =
    useSalesInvoices({
      token,
      skip: page * PAGE_SIZE,
      top: PAGE_SIZE,
      filter: appliedFilter,
    });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setAppliedFilter(`substringof(docCode, '${searchTerm}') or substringof(customerName, '${searchTerm}')`);
    } else {
      setAppliedFilter("");
    }
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setAppliedFilter("");
    setPage(0);
  };

  const formatCurrency = (amount: number, currency: string = "MYR") => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currency || "MYR",
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-MY", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (tokenLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sales Invoices
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <Input
                placeholder="Search by invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full sm:w-64"
              />
              <Button onClick={handleSearch} variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {appliedFilter && (
              <Button onClick={clearSearch} variant="ghost" size="sm">
                Clear
              </Button>
            )}
            <Button onClick={() => refresh()} variant="outline" size="icon">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-destructive">Failed to load invoices</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => refresh()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No invoices found</p>
            {appliedFilter && (
              <Button onClick={clearSearch} variant="outline" size="sm">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Net Total</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, index) => (
                    <TableRow key={invoice.id || index}>
                      <TableCell className="font-medium">
                        {invoice.docCode || "-"}
                      </TableCell>
                      <TableCell>{formatDate(invoice.docDate)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customerName || invoice.invoiceTo || "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.customerCode || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {invoice.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.netTotalAmount, invoice.currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.outstandingAmount, invoice.currencyCode)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.isCancelled
                              ? "destructive"
                              : invoice.outstandingAmount === 0
                              ? "default"
                              : "secondary"
                          }
                        >
                          {invoice.isCancelled
                            ? "Cancelled"
                            : invoice.outstandingAmount === 0
                            ? "Paid"
                            : "Outstanding"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1} to{" "}
                {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}{" "}
                invoices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
