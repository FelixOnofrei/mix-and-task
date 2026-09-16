import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ braindump: z.string().min(3).max(4000) });

export type ClarityProposal = {
  actions: string[];
  focus: string[];
};

const SYSTEM = `You turn a messy brain dump into a calm, doable plan.
Rules:
- Return 3 to 7 "actions": tiny, concrete next physical actions, each under 60 characters, starting with a verb.
- Break anything the person is avoiding into an easy first step.
- Then choose exactly 3 of those actions (copied word for word) as "focus", ordered so the most avoided/unblocking one comes first.
- No preamble, no emoji, no numbering inside the strings.`;

export const getClarity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<ClarityProposal> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: data.braindump },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "clarity_proposal",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                actions: { type: "array", items: { type: "string" } },
                focus: { type: "array", items: { type: "string" } },
              },
              required: ["actions", "focus"],
            },
          },
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Too many requests right now — try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are used up. Add credits in Lovable to keep using Clarity.");
      throw new Error(`Clarity could not be generated (${res.status}).`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<ClarityProposal>;

    const actions = (parsed.actions ?? []).map((a) => a.trim()).filter(Boolean).slice(0, 7);
    const focus = (parsed.focus ?? [])
      .map((f) => f.trim())
      .filter((f) => actions.includes(f))
      .slice(0, 3);

    return { actions, focus: focus.length ? focus : actions.slice(0, 3) };
  });
