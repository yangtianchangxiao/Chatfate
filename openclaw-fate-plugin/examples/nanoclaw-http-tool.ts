export type FateInvokePayload = {
  birth_date: string;
  question: string;
  birth_time_index?: number;
  gender?: "male" | "female";
  lang?: string;
  agent_max_steps?: number;
  search_tree_enabled?: boolean;
  trace_enabled?: boolean;
  include_steps?: boolean;
  include_events?: boolean;
  session_id?: string;
  anonymous_id?: string;
  user_id?: string;
};

export type FateInvokeResult = {
  ok?: boolean;
  answer_text?: string;
  steps?: string[];
  done?: Record<string, unknown>;
  [key: string]: unknown;
};

export const FATE_TOOL_POLICY_PROMPT = `
Use invokeFateReading when the user asks for Zi Wei / fate reading.

Rules:
- Ask for birth date and birth time index if missing.
- Prefer search_tree_enabled=true for timing questions like 什么时候/哪年适合.
- Keep the final answer grounded in the returned answer_text.
- If steps are returned, you may summarize the decision process briefly.
`.trim();

export async function invokeFateReading(
  baseUrl: string,
  payload: FateInvokePayload,
  apiKey?: string,
): Promise<FateInvokeResult> {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/api/fateclawd/invoke`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      birth_time_index: 6,
      gender: "male",
      lang: "zh-CN",
      include_steps: true,
      ...payload,
    }),
  });

  const text = await response.text();
  const data = JSON.parse(text) as FateInvokeResult;
  if (!response.ok) {
    throw new Error(`Fate API ${response.status}: ${text.slice(0, 500)}`);
  }
  return data;
}
