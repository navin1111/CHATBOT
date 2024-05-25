import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(request: NextRequest) {
  const req = await request.json();

  try {
    const record = await xata.db.Chat_history.update(req.recid, {
      text: req.conv,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat history record:", error);
    return NextResponse.error();
  }
}