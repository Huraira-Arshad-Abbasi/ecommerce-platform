import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Get product" });
}

export async function PUT() {
  return NextResponse.json({ message: "Update product" });
}

export async function DELETE() {
  return NextResponse.json({ message: "Delete product" });
}
