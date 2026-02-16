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
    // Forward the status code and data exactly as received
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Network Proxy Error" },
      { status: 500 },
    );
  }
}
