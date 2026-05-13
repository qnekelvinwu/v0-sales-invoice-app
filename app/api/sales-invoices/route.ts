import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://openapi.account.qne.cloud";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const skip = searchParams.get("$skip") || "0";
  const top = searchParams.get("$top") || "20";
  const filter = searchParams.get("$filter") || "";
  const orderby = searchParams.get("$orderby") || "docDate desc";

  if (!token) {
    return NextResponse.json(
      { success: false, error: "JWT token is required" },
      { status: 401 }
    );
  }

  try {
    const queryParams = new URLSearchParams({
      $skip: skip,
      $top: top,
      $orderby: orderby,
    });

    if (filter) {
      queryParams.set("$filter", filter);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/SalesInvoices/List?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${response.status} - ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Handle various response structures from the API
    // API returns: { data: { count: number, value: [...] } }
    let invoices = [];
    let totalCount = 0;

    if (Array.isArray(data)) {
      invoices = data;
      totalCount = data.length;
    } else if (data.data && typeof data.data === "object" && Array.isArray(data.data.value)) {
      // Handle nested structure: { data: { count, value } }
      invoices = data.data.value;
      totalCount = data.data.count || data.data.value.length;
    } else if (data.data && Array.isArray(data.data)) {
      invoices = data.data;
      totalCount = data.totalCount || data.data.length;
    } else if (data.value && Array.isArray(data.value)) {
      invoices = data.value;
      totalCount = data.count || data["@odata.count"] || data.value.length;
    } else if (data.items && Array.isArray(data.items)) {
      invoices = data.items;
      totalCount = data.totalCount || data.items.length;
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
