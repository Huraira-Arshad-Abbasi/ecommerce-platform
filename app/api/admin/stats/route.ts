import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const [totalOrders, totalProducts, totalCustomers, recentOrders] =
    await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "name email")
        .lean(),
    ]);

  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  return NextResponse.json({
    totalOrders,
    totalProducts,
    totalCustomers,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentOrders,
  });
}
