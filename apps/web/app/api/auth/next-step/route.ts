import { getPostAuthPath } from "@/lib/auth/profile";

export async function GET() {
  const path = await getPostAuthPath();
  return new Response(path, {
    headers: { "Content-Type": "text/plain" },
  });
}
