import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { items, shippingAddress } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  await connectToDatabase();

  // Verify products exist and have stock
  const productIds = items.map((item: { product: string }) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  if (products.length !== items.length) {
    return NextResponse.json(
      { error: "Some products were not found" },
      { status: 400 }
    );
  }

  // Check stock and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(
      (p) => p._id.toString() === item.product
    );
    if (!product) {
      return NextResponse.json(
        { error: `Product ${item.product} not found` },
        { status: 400 }
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 400 }
      );
    }
    totalAmount += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // Create order
  const order = await Order.create({
    customer: session.userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    status: "pending",
    paymentMethod: "cod",
  });

  // Decrease stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  return NextResponse.json(order, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const orders = await Order.find({ customer: session.userId })
    .sort({ createdAt: -1 })
    .populate("items.product", "name images")
    .lean();

  return NextResponse.json(orders);
}
