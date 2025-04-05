import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { cartItems, deliveryInfo } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Process the order (using the agent ID from auth)
    const result = await createOrder(userId, cartItems, deliveryInfo);

    if (result.success) {
      return NextResponse.json({
        success: true,
        order: result.order,
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json( 
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}