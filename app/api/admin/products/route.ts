import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name slug")
      .populate("supplier", "name")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    slug,
    description,
    price,
    compareAtPrice,
    images,
    category,
    supplier,
    stock,
    isActive,
  } = body;

  if (!name || !slug || !description || !price || !category || !supplier) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const existing = await Product.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
      { status: 400 }
    );
  }

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    compareAtPrice,
    images: images || [],
    category,
    supplier,
    stock: stock || 0,
    isActive: isActive !== false,
  });

  return NextResponse.json(product, { status: 201 });
}
