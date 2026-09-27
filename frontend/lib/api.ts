import type {
  MatchInput,
  MatchResult,
  RainfallResult,
  Scenario,
  ScenarioInput,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const msg = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `เกิดข้อผิดพลาด (${res.status})`);
    throw new ApiError(msg, res.status);
  }
  return res.json() as Promise<T>;
}

export interface AdminUser {
  email: string;
  name: string;
  picture?: string;
}

export interface AuthConfig {
  enabled: boolean;
  clientId: string;
  domains: string[];
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  email: string | null;
  page: string | null;
  createdAt: string;
}

export interface FeedbackSummary {
  count: number;
  average: number | null;
  /** จำนวนคนที่ให้ 1..5 ดาว */
  distribution: number[];
  items: Feedback[];
}

const TOKEN_KEY = "warma_admin_token";

export const adminToken = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? "";
    } catch {
      return "";
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

function adminHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? adminToken.get() : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  options: () =>
    request<{ crops: string[]; seasons: string[] }>("/scenarios/options"),

  match: (input: MatchInput) =>
    request<MatchResult>("/scenarios/match", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  listScenarios: () => request<Scenario[]>("/scenarios"),

  createScenario: (data: ScenarioInput) =>
    request<Scenario>("/scenarios", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  updateScenario: (id: string, data: ScenarioInput) =>
    request<Scenario>(`/scenarios/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  deleteScenario: (id: string) =>
    request<Scenario>(`/scenarios/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    }),

  authConfig: () => request<AuthConfig>("/auth/config"),

  loginWithGoogle: (credential: string) =>
    request<{ token: string; user: AdminUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  me: () => request<AdminUser | null>("/auth/me", { headers: adminHeaders() }),

  sendFeedback: (data: { rating: number; comment?: string; page?: string }) =>
    request<Feedback>("/feedback", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  feedbackSummary: () =>
    request<FeedbackSummary>("/feedback", { headers: adminHeaders() }),

  rainfall: () => request<RainfallResult>("/rainfall"),

  aiStatus: () => request<{ enabled: boolean }>("/ai/status"),

  aiExplain: (input: MatchInput, scenario: Scenario) =>
    request<{ explanation: string }>("/ai/explain", {
      method: "POST",
      body: JSON.stringify({ input, scenario }),
    }),
};
