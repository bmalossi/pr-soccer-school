const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactPayload {
  parentName?: unknown;
  email?: unknown;
  phone?: unknown;
  playerAge?: unknown;
  city?: unknown;
  program?: unknown;
  message?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function readStringField(
  value: unknown,
  fieldName: string,
  maxLength: number,
  required = true,
): { value: string; error?: string } {
  if (value === undefined || value === null) {
    if (required) {
      return { value: "", error: `${fieldName} is required` };
    }
    return { value: "" };
  }

  if (typeof value !== "string") {
    return { value: "", error: `${fieldName} must be a string` };
  }

  const trimmed = value.trim();
  if (required && !trimmed) {
    return { value: "", error: `${fieldName} is required` };
  }
  if (trimmed.length > maxLength) {
    return { value: "", error: `${fieldName} must be at most ${maxLength} characters` };
  }

  return { value: trimmed };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const parentName = readStringField(payload.parentName, "parentName", 100, true);
  if (parentName.error) return jsonResponse({ error: parentName.error }, 400);

  const email = readStringField(payload.email, "email", 255, true);
  if (email.error) return jsonResponse({ error: email.error }, 400);
  if (!EMAIL_REGEX.test(email.value)) {
    return jsonResponse({ error: "Enter a valid email" }, 400);
  }

  const phone = readStringField(payload.phone, "phone", 30, false);
  if (phone.error) return jsonResponse({ error: phone.error }, 400);

  const playerAge = readStringField(payload.playerAge, "playerAge", 10, true);
  if (playerAge.error) return jsonResponse({ error: playerAge.error }, 400);

  const city = readStringField(payload.city, "city", 120, true);
  if (city.error) return jsonResponse({ error: city.error }, 400);

  const program = readStringField(payload.program, "program", 80, true);
  if (program.error) return jsonResponse({ error: program.error }, 400);

  const message = readStringField(payload.message, "message", 1000, true);
  if (message.error) return jsonResponse({ error: message.error }, 400);

  const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL")?.trim().replace(/\/+$/, "") ?? "";
  const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY")?.trim() ?? "";
  const instance = Deno.env.get("EVOLUTION_INSTANCE")?.trim() || "pessoal";
  const consultantPhone = (Deno.env.get("CONSULTANT_PHONE")?.trim() || "14089089805").replace(
    /\D/g,
    "",
  );

  if (!evolutionApiUrl || !evolutionApiKey || !consultantPhone) {
    console.error("[notify-consultant] Missing required Evolution API environment variables");
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const messageText = [
    "*Solicitação de Contato* 👶🏻❤️",
    "",
    `*Name*: ${parentName.value}`,
    `*E-mail*: ${email.value}`,
    `*Phone*: ${phone.value}`,
    `*Player Age*: ${playerAge.value}`,
    `*City*: ${city.value}`,
    `*Program*: ${program.value}`,
    `*Message*: ${message.value}`,
  ].join("\n");

  try {
    const evolutionRes = await fetch(
      `${evolutionApiUrl}/message/sendText/${encodeURIComponent(instance)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: evolutionApiKey,
        },
        body: JSON.stringify({
          number: consultantPhone,
          text: messageText,
        }),
      },
    );

    if (!evolutionRes.ok) {
      const errorBody = await evolutionRes.text().catch(() => "");
      console.error(
        `[notify-consultant] Evolution API sendText failed (${evolutionRes.status}): ${errorBody}`,
      );
      return jsonResponse({ error: "Failed to send WhatsApp notification" }, 502);
    }

    const data = (await evolutionRes.json().catch(() => ({}))) as {
      key?: { id?: string };
    };

    return jsonResponse({
      success: true,
      messageId: data?.key?.id ?? null,
    });
  } catch (err) {
    console.error("[notify-consultant] Unexpected error calling Evolution API:", err);
    return jsonResponse({ error: "Failed to send WhatsApp notification" }, 502);
  }
});
