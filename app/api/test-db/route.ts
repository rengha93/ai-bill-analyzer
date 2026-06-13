import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    const bills = db.collection("bills");

    // insert a dummy doc
    const result = await bills.insertOne({
      billId: "test_bill_001",
      message: "MongoDB connection works!",
      createdAt: new Date(),
    });

    // retrieve it back
    const inserted = await bills.findOne({ billId: "test_bill_001" });

    return NextResponse.json({ success: true, insertedId: result.insertedId, doc: inserted });
  } catch (error) {
    console.error("Mongo test error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}