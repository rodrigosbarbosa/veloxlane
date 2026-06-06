import { NextResponse } from "next/server";
import { z } from "zod";

import { sendWelcomeEmail } from "@/lib/auth/welcome-email";

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  await sendWelcomeEmail(parsed.data);
  return NextResponse.json({ ok: true });
}
