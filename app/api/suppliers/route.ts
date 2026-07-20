import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Supplier from "@/models/Supplier";

export async function GET() {
  await connectToDatabase();
  const suppliers = await Supplier.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  return NextResponse.json(suppliers);
}
