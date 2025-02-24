import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse, NextRequest } from "next/server";

const { handlers } = NextAuth(authConfig);

export const GET = async (req: NextRequest) => {
  try {
    return await handlers.GET(req);
  } catch (error) {
    console.error("NextAuth GET error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    return await handlers.POST(req);
  } catch (error) {
    console.error("NextAuth POST error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
};

