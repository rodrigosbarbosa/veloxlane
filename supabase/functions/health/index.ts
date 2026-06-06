import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  return new Response(
    JSON.stringify({ status: "ok", service: "veloxlane-health" }),
    {
      headers: { "content-type": "application/json" },
    },
  );
});
