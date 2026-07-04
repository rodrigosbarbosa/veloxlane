import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { handleAutocheckRequest } from "../_shared/autocheck.ts";
import { corsHeaders } from "../_shared/vin.ts";

Deno.serve((request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return handleAutocheckRequest(request);
});
