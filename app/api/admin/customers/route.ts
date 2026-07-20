import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email createdAt")
      .lean(),
    User.countDocuments({ role: "customer" }),
  ]);

  // Get order counts for each customer
  const customerIds = customers.map((c) => c._id);
  const orderCounts = await Order.aggregate([
    { $match: { customer: { $in: customerIds } } },
    { $group: { _id: "$customer", count: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
  ]);

  const countMap = new Map(
    orderCounts.map((o) => [o._id.toString(), { count: o.count, totalSpent: o.totalSpent }])
  );

  const customersWithStats = customers.map((c) => ({
    ...c,
    orderCount: countMap.get(c._id.toString())?.count || 0,
    totalSpent: countMap.get(c._id.toString())?.totalSpent || 0,
  }));

  return NextResponse.json({
    customers: customersWithStats,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
