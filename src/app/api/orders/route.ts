import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    orders: [
      {
        orderNumber: "CSP-2026-8921",
        customerName: "Tanvir Ahmed",
        totalAmount: 31400,
        status: "PROCESSING",
        paymentGateway: "BKASH",
        hasKnockingService: true,
      },
      {
        orderNumber: "CSP-2026-8920",
        customerName: "Mahmudur Rahman",
        totalAmount: 14880,
        status: "SHIPPED",
        paymentGateway: "SSLCOMMERZ",
        hasKnockingService: false,
      },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, phone, address, items, paymentMethod } = body;

    if (!customerName || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const orderNumber = `CSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: {
        orderNumber,
        customerName,
        phone,
        address,
        paymentMethod: paymentMethod || "COD",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid order data" },
      { status: 400 }
    );
  }
}
