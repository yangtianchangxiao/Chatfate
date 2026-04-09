type ToolParams = Record<string, unknown>;

type PluginConfig = {
  baseUrl?: string;
  endpointPath?: string;
  apiKey?: string;
  timeoutMs?: number;
  traceEnabledDefault?: boolean;
  includeStepsDefault?: boolean;
  defaultLang?: string;
  paymentMode?: string;
  upgradeUrl?: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value !== "boolean") {
    return undefined;
  }
  return value;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function normalizeEndpointPath(endpointPath: string): string {
  const normalized = endpointPath.trim();
  if (!normalized) {
    return "/api/fateclawd/invoke";
  }
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function joinEndpoint(baseUrl: string, endpointPath: string): string {
  if (endpointPath.startsWith("http://") || endpointPath.startsWith("https://")) {
    return endpointPath;
  }
  return `${normalizeBaseUrl(baseUrl)}${normalizeEndpointPath(endpointPath)}`;
}

function pickText(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "";
  }
  const obj = data as Record<string, unknown>;
  return typeof obj.answer_text === "string" ? obj.answer_text : "";
}

function pickSteps(data: unknown): string[] {
  const obj = asRecord(data);
  const steps = Array.isArray(obj?.steps) ? obj?.steps : [];
  return steps
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      const stepObj = asRecord(item);
      if (typeof stepObj?.step === "string") {
        return stepObj.step.trim();
      }
      return "";
    })
    .filter(Boolean);
}

function buildSummary(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Fate API returned an invalid response.";
  }

  const obj = data as Record<string, unknown>;
  const done = asRecord(obj.done) ?? {};
  const skillContext = asRecord(done.skill_context) ?? {};
  const yearDecision = asRecord(done.year_decision) ?? {};
  const trendSummary = asRecord(yearDecision.trend_summary) ?? {};
  const winner = asRecord(yearDecision.winner) ?? {};
  const runnerUp = asRecord(yearDecision.runner_up) ?? {};
  const evidenceContext = asRecord(done.evidence_context) ?? {};
  const elapsedMs = asNumber(done.elapsed_ms);
  const keyYear = asNumber(done.key_year);
  const skillName = asString(skillContext.skill_name);
  const searchPolicy = asString(yearDecision.search_policy);
  const mode = asString(yearDecision.mode);
  const paymentRequired = Boolean(done.payment_required);
  const isPaid = done.is_paid === undefined ? true : Boolean(done.is_paid);
  const upgradeUrl = asString(obj.upgrade_url);
  const answerText = pickText(data);
  const steps = pickSteps(data);
  const evidenceSummary = Array.isArray(evidenceContext.summary_lines)
    ? evidenceContext.summary_lines
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];
  const peakYear = asNumber(trendSummary.peak_year);
  const troughYear = asNumber(trendSummary.trough_year);
  const winnerYear = asNumber(winner.year);
  const runnerUpYear = asNumber(runnerUp.year);

  const lines: string[] = [];
  if (elapsedMs !== undefined) {
    lines.push(`elapsed_ms: ${elapsedMs}`);
  }
  if (skillName) {
    lines.push(`skill: ${skillName}`);
  }
  if (mode) {
    lines.push(`mode: ${mode}`);
  }
  if (searchPolicy) {
    lines.push(`search_policy: ${searchPolicy}`);
  }
  if (keyYear !== undefined) {
    lines.push(`key_year: ${keyYear}`);
  }
  if (winnerYear !== undefined && runnerUpYear !== undefined) {
    lines.push(`top_years: ${winnerYear}, ${runnerUpYear}`);
  }
  if (peakYear !== undefined || troughYear !== undefined) {
    lines.push(`trend_peak_trough: ${peakYear ?? "n/a"} / ${troughYear ?? "n/a"}`);
  }
  if (paymentRequired && !isPaid) {
    lines.push("note: preview mode (full report requires payment).");
    if (upgradeUrl) {
      lines.push(`upgrade_url: ${upgradeUrl}`);
    }
  }
  if (steps.length > 0) {
    lines.push("");
    lines.push("steps:");
    for (const step of steps.slice(0, 10)) {
      lines.push(`- ${step}`);
    }
  }
  if (evidenceSummary.length > 0) {
    lines.push("");
    lines.push("evidence:");
    for (const line of evidenceSummary.slice(0, 4)) {
      lines.push(`- ${line}`);
    }
  }
  if (answerText) {
    lines.push("");
    lines.push(answerText);
  } else {
    lines.push("");
    lines.push("No answer_text returned from Fate API.");
  }
  return lines.join("\n");
}

async function safeParseJson(text: string): Promise<unknown> {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function register(api: any) {
  api.registerTool(
    {
      name: "fate_reading",
      label: "Fate Reading",
      description:
        "Call ChatFate fortune runtime with birth info/question and return a structured reading.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          birth_date: {
            type: "string",
            description: "Birth date in YYYY-MM-DD.",
          },
          birth_time_index: {
            type: "integer",
            minimum: 0,
            maximum: 12,
            description: "Ziwei birth hour index. Usually 0-12.",
          },
          gender: {
            type: "string",
            enum: ["male", "female"],
            description: "User gender.",
          },
          question: {
            type: "string",
            description: "Fortune question asked by user.",
          },
          lang: {
            type: "string",
            description: "Language, e.g. zh-CN or en-US.",
          },
          agent_max_steps: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            description: "Max search-tree loop steps.",
          },
          search_tree_enabled: {
            type: "boolean",
            description: "Enable search-tree loop for locate mode.",
          },
          trace_enabled: {
            type: "boolean",
            description: "Return detailed trace in done payload.",
          },
          include_steps: {
            type: "boolean",
            description: "Include thinking/decision/finding steps.",
          },
          include_events: {
            type: "boolean",
            description: "Include raw event list.",
          },
          user_id: {
            type: "string",
            description: "Optional user id.",
          },
          session_id: {
            type: "string",
            description: "Optional session id.",
          },
          anonymous_id: {
            type: "string",
            description: "Optional anonymous id.",
          },
          payment_mode: {
            type: "string",
            enum: ["off", "preview", "enforced"],
            description: "Payment interface mode override.",
          },
          payment_plan: {
            type: "string",
            description: "Future billing plan id (placeholder).",
          },
          payment_session_id: {
            type: "string",
            description: "Future billing session id (placeholder).",
          },
        },
        required: ["birth_date", "question"],
      },
      async execute(_id: string, params: ToolParams) {
        const cfg = (api.pluginConfig ?? {}) as PluginConfig;

        const baseUrl = asString(cfg.baseUrl) ?? asString(process.env.FATECLAWD_BASE_URL);
        if (!baseUrl) {
          throw new Error(
            "fateclawd plugin requires plugins.entries.fateclawd.config.baseUrl (or FATECLAWD_BASE_URL).",
          );
        }

        const endpointPath = asString(cfg.endpointPath) ?? "/api/fateclawd/invoke";
        const endpoint = joinEndpoint(baseUrl, endpointPath);
        const timeoutMs = asNumber(cfg.timeoutMs) ?? 120_000;
        const apiKey = asString(cfg.apiKey) ?? asString(process.env.FATECLAWD_API_KEY);

        const birthDate = asString(params.birth_date);
        const question = asString(params.question);
        if (!birthDate) {
          throw new Error("birth_date is required (YYYY-MM-DD).");
        }
        if (!question) {
          throw new Error("question is required.");
        }

        const payload: Record<string, unknown> = {
          birth_date: birthDate,
          question,
          birth_time_index: asNumber(params.birth_time_index) ?? 6,
          gender: asString(params.gender) ?? "male",
          lang: asString(params.lang) ?? asString(cfg.defaultLang) ?? "zh-CN",
          include_steps:
            asBoolean(params.include_steps) ??
            asBoolean(cfg.includeStepsDefault) ??
            true,
          include_events: asBoolean(params.include_events) ?? false,
        };

        const maybeKeys = [
          "agent_max_steps",
          "search_tree_enabled",
          "trace_enabled",
          "user_id",
          "session_id",
          "anonymous_id",
        ];
        for (const key of maybeKeys) {
          if (params[key] !== undefined) {
            payload[key] = params[key];
          }
        }

        const paymentModeRaw =
          asString(params.payment_mode) ?? asString(cfg.paymentMode) ?? "off";
        const paymentMode = ["off", "preview", "enforced"].includes(paymentModeRaw)
          ? paymentModeRaw
          : "off";
        const sessionTags = Array.isArray(payload.session_tags)
          ? [...(payload.session_tags as unknown[]).map((x) => String(x))]
          : [];
        if (paymentMode === "preview") {
          sessionTags.push("payment_preview");
        }
        if (paymentMode === "enforced") {
          sessionTags.push("payment_on");
        }
        if (sessionTags.length > 0) {
          payload.session_tags = Array.from(new Set(sessionTags));
        }
        if (params.payment_plan !== undefined) {
          payload.payment_plan = params.payment_plan;
        }
        if (params.payment_session_id !== undefined) {
          payload.payment_session_id = params.payment_session_id;
        }

        if (payload.trace_enabled === undefined && asBoolean(cfg.traceEnabledDefault) !== undefined) {
          payload.trace_enabled = asBoolean(cfg.traceEnabledDefault);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));

        let response: Response;
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (apiKey) {
            headers.Authorization = `Bearer ${apiKey}`;
          }
          response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
        } catch (err) {
          throw new Error(`fate_reading request failed: ${String(err)}`);
        } finally {
          clearTimeout(timeout);
        }

        const rawText = await response.text();
        const data = await safeParseJson(rawText);
        if (!response.ok) {
          const errMsg =
            data && typeof data === "object" && typeof (data as Record<string, unknown>).error === "string"
              ? String((data as Record<string, unknown>).error)
              : rawText.slice(0, 500);
          throw new Error(`fate_reading API ${response.status}: ${errMsg}`);
        }
        if (!data || typeof data !== "object") {
          throw new Error("fate_reading API returned non-JSON response.");
        }

        const dataObj = data as Record<string, unknown>;
        const done =
          dataObj.done && typeof dataObj.done === "object"
            ? (dataObj.done as Record<string, unknown>)
            : {};
        delete dataObj.llm_model;
        delete done.llm_model;
        const paymentRequired = Boolean(done.payment_required);
        const isPaid = done.is_paid === undefined ? true : Boolean(done.is_paid);
        const upgradeUrl = asString(cfg.upgradeUrl);
        if (upgradeUrl && paymentRequired && !isPaid) {
          dataObj.upgrade_url = upgradeUrl;
        }

        return {
          content: [{ type: "text", text: buildSummary(dataObj) }],
          details: {
            endpoint,
            request: payload,
            response: dataObj,
            billing: {
              mode: paymentMode,
              status_only: true,
              charged: false,
              payment_required: paymentRequired,
              is_paid: isPaid,
              upgrade_url: upgradeUrl ?? null,
            },
          },
        };
      },
    },
    { optional: true },
  );
}
