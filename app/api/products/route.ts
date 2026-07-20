import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "List products" });
}

export async function POST() {
  return NextResponse.json({ message: "Create product" });
}
