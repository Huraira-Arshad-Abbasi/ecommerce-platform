import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const customer = await User.findById(id)
    .select("name email createdAt")
    .lean();

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const orders = await Order.find({ customer: id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name images")
    .lean();

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return NextResponse.json({
    ...customer,
    orders,
    orderCount: orders.length,
    totalSpent,
  });
}
