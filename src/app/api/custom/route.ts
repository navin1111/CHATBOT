import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(request: NextRequest) {
  const req = await request.json();

  try {
    const record = await xata.db.Chat_history.create({
      uniqueid: req.id,
      pdf_url:req.url_pdf,
      text: req.conv,
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating chat history record:", error);
    return NextResponse.error();
  }
}


