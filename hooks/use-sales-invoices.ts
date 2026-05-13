"use client";

import useSWR from "swr";
import type { SalesInvoice, ApiResponse } from "@/lib/types";

interface UseSalesInvoicesParams {
  token: string;
  skip?: number;
  top?: number;
  filter?: string;
  orderby?: string;
}

const fetcher = async (url: string): Promise<ApiResponse<SalesInvoice[]>> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export function useSalesInvoices({
  token,
  skip = 0,
  top = 20,
  filter = "",
  orderby = "docDate desc",
}: UseSalesInvoicesParams) {
  const params = new URLSearchParams({
    token,
    $skip: skip.toString(),
    $top: top.toString(),
    $orderby: orderby,
  });

  if (filter) {
    params.set("$filter", filter);
  }

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SalesInvoice[]>>(
    token ? `/api/sales-invoices?${params.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // Ensure invoices is always an array
  const invoices = Array.isArray(data?.data) ? data.data : [];
  
  return {
    invoices,
    totalCount: data?.totalCount || 0,
    isLoading,
    isError: error || (data && !data.success),
    errorMessage: error?.message || data?.error,
    refresh: mutate,
  };
}
