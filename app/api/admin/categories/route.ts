import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
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

  const [categories, total] = await Promise.all([
    Category.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Category.countDocuments(),
  ]);

  return NextResponse.json({
    categories,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, description, image, isActive } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const existing = await Category.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 400 }
    );
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    isActive: isActive !== false,
  });

  return NextResponse.json(category, { status: 201 });
}
