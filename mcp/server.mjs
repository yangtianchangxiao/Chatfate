#!/usr/bin/env node
/**
 * ChatFate Model Context Protocol (MCP) Server
 * Zero-dependency stdio JSON-RPC 2.0 server for Node.js >= 18.
 *
 * Tools:
 *  1. calculate_ziwei_bazi_chart     — True Solar Time Sanhe Zi Wei Dou Shu 12 palaces + Solar-Term Four Pillars BaZi / Saju
 *  2. calculate_relationship_synastry — Dual-chart BaZi + Zi Wei synastry + Composite 22-Arcana Matrix
 *  3. calculate_destiny_matrix       — Deterministic local 22-Major-Arcana Destiny Matrix & Karmic Tail calculator
 *  4. search_true_solar_city         — 53,000+ global city/county longitude & IANA timezone lookup
 *
 * Web platform: https://chatfate.life
 * Docs & benchmark: https://yangtianchangxiao.github.io/Chatfate/
 */

const BASE_URL = (process.env.CHATFATE_BASE_URL || "https://chatfate.life").replace(/\/+$/, "");
const SERVER_INFO = {
  name: "chatfate-mcp",
  version: "1.2.0",
};

const ARCANA = [
  ["The Magician", "Initiative, sharp communication, turning ideas into tangible beginnings."],
  ["The High Priestess", "Intuition, quiet discernment, reading unspoken dynamics."],
  ["The Empress", "Nurturing abundance, design sensibility, grounded care."],
  ["The Emperor", "Structure, ownership, calm authority, reliable systems."],
  ["The Hierophant", "Tradition, mentorship, principled knowledge transmission."],
  ["The Lovers", "Mutual alignment, wholehearted choice, relational harmony."],
  ["The Chariot", "Focused momentum, decisive pivots, disciplined pacing."],
  ["Justice", "Cause-and-effect clarity, fair contracts, balanced accountability."],
  ["The Hermit", "Specialist depth, reflective solitude, distilled wisdom."],
  ["Wheel of Fortune", "Cyclical timing, adaptable pivots, catching rising windows."],
  ["Strength", "Resilient stamina, composed courage, sustainable boundaries."],
  ["The Hanged Man", "Perspective shift, deliberate reframing, ending passive limbo."],
  ["Death", "Clean chapter transitions, releasing expired commitments, renewal."],
  ["Temperance", "Measured integration, steady emotional repair, proportion."],
  ["The Devil", "Magnetic ambition, shadow awareness, discerning leverage vs attachment."],
  ["The Tower", "Structural truth, clearing fragile illusions, clean rebuilding."],
  ["The Star", "Long-range vision, creative voice, hope anchored in craft."],
  ["The Moon", "Deep emotional radar, distinguishing intuition from fear projection."],
  ["The Sun", "Warm visibility, generous leadership, clear creative output."],
  ["Judgement", "Generational pattern renewal, answering a higher-consequence chapter."],
  ["The World", "Cross-border synthesis, spacious partnership, completing open loops."],
  ["The Fool", "Unscripted exploration, beginner courage, calculated freedom."],
];

export function reduce22(n) {
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new RangeError("Arcana value must be a positive integer.");
  }
  let v = n;
  while (v > 22) {
    v = String(v)
      .split("")
      .reduce((acc, digit) => acc + Number(digit), 0);
  }
  return v;
}

export function calculateDestinyMatrix(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ""))) {
    throw new RangeError("birth_date must be YYYY-MM-DD in the Gregorian calendar.");
  }
  const [year, month, day] = isoDate.split("-").map(Number);
  const parsed = new Date(`${isoDate}T12:00:00Z`);
  if (
    year < 1800 ||
    year > 2200 ||
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== isoDate
  ) {
    throw new RangeError("Enter a valid Gregorian date between 1800-01-01 and 2200-12-31.");
  }
  const A = reduce22(day);
  const B = reduce22(month);
  const C = reduce22([...String(year)].reduce((acc, d) => acc + Number(d), 0));
  const D = reduce22(A + B + C);
  const X = reduce22(A + B + C + D);
  const E = reduce22(A + B);
  const F = reduce22(B + C);
  const G = reduce22(C + D);
  const H = reduce22(D + A);
  const C2 = reduce22(C + X);
  const D2 = reduce22(D + X);
  const D1 = reduce22(D + D2);
  const balance = reduce22(C2 + D2);
  const love = reduce22(D2 + balance);
  const money = reduce22(C2 + balance);
  const sky = reduce22(B + D);
  const earth = reduce22(A + C);
  const purpose = reduce22(sky + earth);
  const label = (num) => ({
    number: num,
    archetype: ARCANA[num - 1][0],
    theme: ARCANA[num - 1][1],
  });
  return {
    birth_date: isoDate,
    nodes: { A, B, C, D, E, F, G, H, X, C2, D2, D1, balance, love, money, sky, earth, purpose },
    center_comfort_zone: label(X),
    karmic_tail: {
      triad: `${D2}-${D1}-${D}`,
      arcana: [label(D2), label(D1), label(D)],
    },
    love_channel: {
      triad: `${D2}-${love}-${balance}`,
      arcana: [label(D2), label(love), label(balance)],
    },
    money_channel: {
      triad: `${balance}-${money}-${C2}`,
      arcana: [label(balance), label(money), label(C2)],
    },
    personal_purpose: {
      sky: label(sky),
      earth: label(earth),
      synthesis: label(purpose),
    },
  };
}

export function combineDestinyMatrices(m1, m2) {
  const keys = [
    "A", "B", "C", "D", "E", "F", "G", "H", "X",
    "C2", "D2", "D1", "balance", "love", "money", "sky", "earth", "purpose",
  ];
  const nodes = {};
  for (const k of keys) {
    nodes[k] = reduce22(m1.nodes[k] + m2.nodes[k]);
  }
  const label = (num) => ({
    number: num,
    archetype: ARCANA[num - 1][0],
    theme: ARCANA[num - 1][1],
  });
  return {
    nodes,
    composite_center: label(nodes.X),
    composite_karmic_tail: `${nodes.D2}-${nodes.D1}-${nodes.D}`,
    composite_love_channel: `${nodes.D2}-${nodes.love}-${nodes.balance}`,
    composite_money_channel: `${nodes.balance}-${nodes.money}-${nodes.C2}`,
    composite_purpose: label(nodes.purpose),
  };
}

async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "chatfate-mcp/1.2.0 (+https://github.com/yangtianchangxiao/Chatfate)",
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || `HTTP ${res.status} from ${path}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

const TOOLS = [
  {
    name: "calculate_ziwei_bazi_chart",
    description:
      "Calculate a deterministic True Solar Time Sanhe Zi Wei Dou Shu 12-palace chart and Solar-Term Four Pillars BaZi / Korean Saju chart via ChatFate. Supports 53,000+ global cities/counties, historical IANA DST, solar or lunar dates, and uncertain birth hours.",
    annotations: { readOnlyHint: true, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Birth date in YYYY-MM-DD format (solar/Gregorian by default, or lunar if calendar='lunar').",
        },
        birth_time_index: {
          type: "integer",
          minimum: -1,
          maximum: 12,
          default: 6,
          description:
            "Chinese 2-hour branch index: -1=unknown (defaults to noon calibration), 0=Early Zi (00:00-00:59), 1=Chou (01:00-02:59), 2=Yin (03:00-04:59), 3=Mao (05:00-06:59), 4=Chen (07:00-08:59), 5=Si (09:00-10:59), 6=Wu (11:00-12:59), 7=Wei (13:00-14:59), 8=Shen (15:00-16:59), 9=You (17:00-18:59), 10=Xu (19:00-20:59), 11=Hai (21:00-22:59), 12=Late Zi (23:00-23:59).",
        },
        birth_clock_time: {
          type: "string",
          description: "Optional exact clock time HH:MM (e.g. '14:35') for minute-accurate True Solar Time + Equation of Time calibration.",
        },
        gender: {
          type: "string",
          enum: ["male", "female"],
          default: "male",
          description: "Chart gender ('male' or 'female', used for clockwise/counter-clockwise 10-year decadal palace direction).",
        },
        calendar: {
          type: "string",
          enum: ["solar", "lunar"],
          default: "solar",
          description: "Calendar system of birth_date.",
        },
        is_leap_month: {
          type: "boolean",
          default: false,
          description: "True only when calendar='lunar' and the birth month is an intercalary leap month.",
        },
        city_id: {
          type: "string",
          description: "Optional city ID from search_true_solar_city (e.g. 'shanghai', 'seoul', 'taipei', 'tokyo', 'new_york').",
        },
        longitude: {
          type: "number",
          minimum: -180,
          maximum: 180,
          description: "Optional explicit birth longitude (-180 to 180) if city_id is not specified.",
        },
        auto_true_solar: {
          type: "boolean",
          default: true,
          description: "Apply longitude meridian offset and solar equation of time when city_id or longitude is provided.",
        },
        auto_dst: {
          type: "boolean",
          default: true,
          description: "Deduct historical Daylight Saving Time using IANA ZoneInfo rules.",
        },
        lang: {
          type: "string",
          enum: ["zh", "tw", "en", "ko"],
          default: "en",
          description: "Output language code.",
        },
      },
      required: ["birth_date", "gender"],
    },
  },
  {
    name: "calculate_relationship_synastry",
    description:
      "Compare two people's birth charts using BaZi Day-Pillar stem-branch chemistry, Sanhe Zi Wei cross-chart Sihua transformations, and a composite 22-Arcana Destiny Matrix. Birth hour is optional.",
    annotations: { readOnlyHint: true, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        person_a: {
          type: "object",
          description: "First person's birth details.",
          properties: {
            birth_date: { type: "string", description: "YYYY-MM-DD" },
            birth_time_index: { type: "integer", minimum: -1, maximum: 12, default: 6 },
            gender: { type: "string", enum: ["male", "female"], default: "male" },
            calendar: { type: "string", enum: ["solar", "lunar"], default: "solar" },
          },
          required: ["birth_date"],
        },
        person_b: {
          type: "object",
          description: "Second person's birth details.",
          properties: {
            birth_date: { type: "string", description: "YYYY-MM-DD" },
            birth_time_index: { type: "integer", minimum: -1, maximum: 12, default: 6 },
            gender: { type: "string", enum: ["male", "female"], default: "female" },
            calendar: { type: "string", enum: ["solar", "lunar"], default: "solar" },
          },
          required: ["birth_date"],
        },
        lang: {
          type: "string",
          enum: ["zh", "tw", "en", "ko"],
          default: "en",
        },
      },
      required: ["person_a", "person_b"],
    },
  },
  {
    name: "calculate_destiny_matrix",
    description:
      "Deterministically compute the 22-Major-Arcana Destiny Matrix octagon, Center Comfort Zone, Karmic Tail triad (D2-D1-D), Love & Money Channels, and Personal Purpose locally from a Gregorian birth date (plus optional partner composite matrix).",
    annotations: { readOnlyHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Gregorian birth date in YYYY-MM-DD format (1800-2200).",
        },
        partner_birth_date: {
          type: "string",
          description: "Optional second Gregorian birth date (YYYY-MM-DD) to compute a Composite Couple Matrix.",
        },
      },
      required: ["birth_date"],
    },
  },
  {
    name: "search_true_solar_city",
    description:
      "Search ChatFate's 53,000+ global city, county, and district atlas to resolve city_id, exact longitude, IANA timezone, and standard meridian offset for True Solar Time calibration.",
    annotations: { readOnlyHint: true, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "City, county, or district name in English, Chinese, or Korean (e.g. 'Shanghai', '成都', '서울', 'Taipei', 'London').",
        },
      },
      required: ["query"],
    },
  },
];

async function executeTool(name, args = {}) {
  if (name === "calculate_ziwei_bazi_chart") {
    const payload = {
      birth_date: args.birth_date,
      birth_time_index: args.birth_time_index ?? 6,
      gender: args.gender || "male",
      calendar: args.calendar || "solar",
      is_leap_month: Boolean(args.is_leap_month),
      auto_true_solar: args.auto_true_solar !== false,
      auto_dst: args.auto_dst !== false,
      lang: args.lang || "en",
    };
    if (args.birth_clock_time) payload.birth_clock_time = args.birth_clock_time;
    if (args.city_id) payload.city_id = args.city_id;
    if (typeof args.longitude === "number") {
      payload.longitude = args.longitude;
      if (!payload.city_id) payload.city_id = "custom";
    }
    const res = await fetchJson("/api/chart", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const hubUrl =
      payload.lang === "zh" ? `${BASE_URL}/zh/`
      : payload.lang === "tw" ? `${BASE_URL}/tw/`
      : payload.lang === "ko" ? `${BASE_URL}/ko/`
      : `${BASE_URL}/en/`;
    return {
      interactive_web_url: hubUrl,
      birth_info: res.birth_info,
      true_solar_calibration: res.true_solar,
      four_pillars_bazi: res.bazi,
      ziwei_twelve_palaces: res.palaces,
    };
  }

  if (name === "calculate_relationship_synastry") {
    const lang = args.lang || "en";
    const personA = {
      birth_date: args.person_a?.birth_date,
      birth_time_index: args.person_a?.birth_time_index ?? 6,
      gender: args.person_a?.gender || "male",
      calendar: args.person_a?.calendar || "solar",
    };
    const personB = {
      birth_date: args.person_b?.birth_date,
      birth_time_index: args.person_b?.birth_time_index ?? 6,
      gender: args.person_b?.gender || "female",
      calendar: args.person_b?.calendar || "solar",
    };
    const synastry = await fetchJson("/api/compatibility", {
      method: "POST",
      body: JSON.stringify({ person_a: personA, person_b: personB, lang }),
    });
    let compositeMatrix = null;
    if (personA.calendar === "solar" && personB.calendar === "solar") {
      try {
        compositeMatrix = combineDestinyMatrices(
          calculateDestinyMatrix(personA.birth_date),
          calculateDestinyMatrix(personB.birth_date)
        );
      } catch {
        compositeMatrix = null;
      }
    }
    return {
      interactive_synastry_url:
        lang === "zh" ? `${BASE_URL}/zh/fenshou-fuhe`
        : lang === "tw" ? `${BASE_URL}/tw/fenshou-fuhe`
        : lang === "ko" ? `${BASE_URL}/ko/jaehoe-unse`
        : `${BASE_URL}/destiny-matrix-compatibility`,
      compatibility: synastry,
      composite_destiny_matrix: compositeMatrix,
    };
  }

  if (name === "calculate_destiny_matrix") {
    const primary = calculateDestinyMatrix(args.birth_date);
    const out = {
      interactive_calculator_url: `${BASE_URL}/destiny-matrix-calculator`,
      karmic_tail_guide_url: `${BASE_URL}/karmic-tail-calculator`,
      primary_matrix: primary,
    };
    if (args.partner_birth_date) {
      const partner = calculateDestinyMatrix(args.partner_birth_date);
      out.partner_matrix = partner;
      out.composite_matrix = combineDestinyMatrices(primary, partner);
      out.interactive_compatibility_url = `${BASE_URL}/destiny-matrix-compatibility`;
    }
    return out;
  }

  if (name === "search_true_solar_city") {
    const q = encodeURIComponent(String(args.query || "").trim());
    const res = await fetchJson(`/api/cities?q=${q}`);
    return {
      true_solar_guide_url: `${BASE_URL}/guides/true-solar-time`,
      cities: (res.cities || []).slice(0, 15),
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handleRpcMessage(msg) {
  if (!msg || typeof msg !== "object") return null;
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  try {
    if (method === "initialize") {
      const requestedVersion = params?.protocolVersion || "2024-11-05";
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: requestedVersion,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        },
      };
    }

    if (method === "notifications/initialized" || isNotification) {
      return null;
    }

    if (method === "ping") {
      return { jsonrpc: "2.0", id, result: {} };
    }

    if (method === "tools/list") {
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const output = await executeTool(toolName, toolArgs);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            isError: false,
          },
        };
      } catch (toolErr) {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `Error: ${toolErr.message || String(toolErr)}` }],
            isError: true,
          },
        };
      }
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    };
  } catch (err) {
    if (isNotification) return null;
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: err.message || "Internal error" },
    };
  }
}

function writeResponse(payload, useContentLength) {
  if (!payload) return;
  const serialized = JSON.stringify(payload);
  if (useContentLength) {
    const byteLength = Buffer.byteLength(serialized, "utf8");
    process.stdout.write(`Content-Length: ${byteLength}\r\n\r\n${serialized}`);
  } else {
    process.stdout.write(`${serialized}\n`);
  }
}

async function runSelfTest() {
  const matrix = calculateDestinyMatrix("1992-06-23");
  if (matrix.karmic_tail.triad !== "15-20-5" || matrix.nodes.X !== 10) {
    throw new Error(`Destiny Matrix verification vector failed: got ${JSON.stringify(matrix)}`);
  }
  const initRes = await handleRpcMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "self-test", version: "1.0.0" } },
  });
  const listRes = await handleRpcMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  if (listRes?.result?.tools?.length !== 4) {
    throw new Error("Expected 4 MCP tools in tools/list");
  }
  const chartRes = await handleRpcMessage({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "calculate_ziwei_bazi_chart",
      arguments: { birth_date: "1992-06-23", birth_time_index: 6, gender: "male", city_id: "shanghai", lang: "en" },
    },
  });
  if (chartRes?.result?.isError) {
    throw new Error(`Live chart check failed: ${chartRes.result.content[0].text}`);
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        server: initRes.result.serverInfo,
        tools: listRes.result.tools.map((t) => t.name),
        benchmark_1992_06_23: { comfort_zone: matrix.nodes.X, karmic_tail: matrix.karmic_tail.triad },
      },
      null,
      2
    )
  );
}

if (process.argv.includes("--self-test")) {
  runSelfTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  let buffer = Buffer.alloc(0);
  process.stdin.on("data", async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length > 0) {
      const headerMatch = buffer.slice(0, 128).toString("utf8").match(/^Content-Length:\s*(\d+)\r?\n\r?\n/i);
      if (headerMatch) {
        const headerBytes = Buffer.byteLength(headerMatch[0], "utf8");
        const bodyBytes = Number(headerMatch[1]);
        if (buffer.length < headerBytes + bodyBytes) break;
        const rawJson = buffer.slice(headerBytes, headerBytes + bodyBytes).toString("utf8");
        buffer = buffer.slice(headerBytes + bodyBytes);
        try {
          const response = await handleRpcMessage(JSON.parse(rawJson));
          writeResponse(response, true);
        } catch {
          // Ignore malformed frame
        }
        continue;
      }

      const newlineIdx = buffer.indexOf(0x0a);
      if (newlineIdx === -1) break;
      const line = buffer.slice(0, newlineIdx).toString("utf8").trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line) continue;
      try {
        const response = await handleRpcMessage(JSON.parse(line));
        writeResponse(response, false);
      } catch {
        // Ignore malformed line
      }
    }
  });
}
