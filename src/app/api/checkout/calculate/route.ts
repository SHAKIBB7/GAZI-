import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items = [], couponCode, shippingDivision = "Dhaka" } = body;

    let subtotal = 0;
    let knockingTotal = 0;

    for (const item of items) {
      const price = item.price || 0;
      const qty = item.quantity || 1;
      subtotal += price * qty;
      if (item.addKnockingService) {
        knockingTotal += 1500 * qty;
      }
    }

    const shippingFee = shippingDivision.toLowerCase().includes("dhaka") ? 80 : 150;

    let discount = 0;
    if (couponCode === "CRICKET10") {
      discount = (subtotal * 10) / 100;
    } else if (couponCode === "DHAKA500") {
      discount = 500;
    }

    const grandTotal = Math.max(0, subtotal + knockingTotal + shippingFee - discount);

    return NextResponse.json({
      success: true,
      calculation: {
        subtotal,
        knockingTotal,
        shippingFee,
        discount,
        grandTotal,
        currency: "BDT",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Calculation failed" },
      { status: 400 }
    );
  }
}
