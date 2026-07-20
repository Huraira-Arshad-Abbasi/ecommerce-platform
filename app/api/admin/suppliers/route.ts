import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Supplier from "@/models/Supplier";
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

  const [suppliers, total] = await Promise.all([
    Supplier.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Supplier.countDocuments(),
  ]);

  return NextResponse.json({
    suppliers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, contactPerson, phone, email, address, isActive } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const supplier = await Supplier.create({
    name,
    contactPerson,
    phone,
    email,
    address,
    isActive: isActive !== false,
  });

  return NextResponse.json(supplier, { status: 201 });
}
