import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(request: NextRequest) {
  const req = await request.json();

  const uniid = req.id;

  try {
    const record = await xata.db.Chat_history.create({
      uniqueid: uniid,
      pdf_url: req.url_pdf,
    });

 console.log("idlogin",record.id)

    return NextResponse.json({ recid: record.id });
  } catch (error) {
    console.error("Error creating chat history record:", error);
    return NextResponse.error();
  }
}