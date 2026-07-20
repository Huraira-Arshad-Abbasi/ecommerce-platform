import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortOption: any = { createdAt: -1 };
  if (sort === "price-asc") sortOption = { price: 1 };
  else if (sort === "price-desc") sortOption = { price: -1 };
  else if (sort === "oldest") sortOption = { createdAt: 1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("category", "name slug")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
