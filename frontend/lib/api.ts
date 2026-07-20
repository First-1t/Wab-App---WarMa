import type { MatchInput, MatchResult, Scenario, ScenarioInput } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

function adminHeaders(): Record<string, string> {
  const key =
    typeof window !== "undefined"
      ? (localStorage.getItem("warma_admin_key") ?? "")
      : "";
  return key ? { "x-admin-key": key } : {};
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

  aiStatus: () => request<{ enabled: boolean }>("/ai/status"),

  aiExplain: (input: MatchInput, scenario: Scenario) =>
    request<{ explanation: string }>("/ai/explain", {
      method: "POST",
      body: JSON.stringify({ input, scenario }),
    }),
};
