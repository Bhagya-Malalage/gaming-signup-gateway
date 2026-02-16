import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(
      "https://affiliate1.bbb365.link/user/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://winner247.co",
          Referer: "https://winner247.co/",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    // Return exactly what the backend says
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Network Proxy Error" },
      { status: 500 },
    );
  }
}
