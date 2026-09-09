import { NextResponse } from "next/server";
import { CRICKET_PRODUCTS } from "@/lib/data/cricket-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const player = searchParams.get("player");
  const limit = parseInt(searchParams.get("limit") || "20");

  let results = [...CRICKET_PRODUCTS];

  if (search) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.brand.name.toLowerCase().includes(search) ||
        p.category.name.toLowerCase().includes(search)
    );
  }

  if (category) {
    results = results.filter((p) => p.category.slug === category);
  }

  if (brand) {
    results = results.filter((p) => p.brand.slug === brand);
  }

  if (player) {
    results = results.filter((p) => p.player?.slug === player);
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    data: results.slice(0, limit),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.basePrice) {
      return NextResponse.json(
        { success: false, error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      sku: `CSP-${Math.floor(1000 + Math.random() * 9000)}`,
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Cricket product created successfully in pending status",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
