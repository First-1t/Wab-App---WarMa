import type { Scenario } from '../../../shared/types/scenario.contracts';

export type ScenarioInput = Omit<Scenario, 'id' | 'minRatio' | 'maxRatio'>;

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

export interface ScenarioOptions {
  crops: string[];
  seasons: string[];
  waterConditions: string[];
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

export interface NotifyStatus {
  mailEnabled: boolean;
  email: string | null;
  subscribed: boolean;
  subscribers: number;
}

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function storage<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

const TOKEN_KEY = 'warma_admin_token';
export const adminToken = {
  get: () => storage(() => localStorage.getItem(TOKEN_KEY) ?? '', ''),
  set: (token: string) => storage(() => localStorage.setItem(TOKEN_KEY, token), undefined),
  clear: () => storage(() => localStorage.removeItem(TOKEN_KEY), undefined),
};

/** ผู้ใช้เลือก "เข้าใช้งานแบบทั่วไป" แล้ว — จำไว้ในเครื่องนี้ ครั้งหน้าไม่ต้องเลือกซ้ำ */
const GUEST_KEY = 'warma_guest';
export const guestMode = {
  get: () => storage(() => localStorage.getItem(GUEST_KEY) === '1', false),
  set: () => storage(() => localStorage.setItem(GUEST_KEY, '1'), undefined),
  clear: () => storage(() => localStorage.removeItem(GUEST_KEY), undefined),
};

async function send<B>(path: string, init?: RequestInit): Promise<B> {
  const token = adminToken.get();
  let response: Response;
  try {
    response = await fetch(`/api/admin${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new AdminApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่', 0);
  }
  const body = (await response.json().catch(() => null)) as
    | (B & { message?: string; details?: string[] })
    | null;
  if (!response.ok) {
    const message = body?.details?.join(', ') || body?.message;
    throw new AdminApiError(message ?? `เกิดข้อผิดพลาด (${response.status})`, response.status);
  }
  return body as B;
}

const request = async <T,>(path: string, init?: RequestInit) =>
  (await send<{ data: T }>(path, init)).data;

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export const adminApi = {
  authConfig: () => request<AuthConfig>('/auth/config'),
  login: (credential: string) =>
    request<{ token: string; user: AdminUser }>('/auth/login', json('POST', { credential })),
  me: () => request<AdminUser | null>('/auth/me'),

  listScenarios: () => send<{ data: Scenario[]; options: ScenarioOptions }>('/scenarios'),
  createScenario: (data: ScenarioInput) => request<Scenario>('/scenarios', json('POST', data)),
  updateScenario: (id: string, data: ScenarioInput) =>
    request<Scenario>(`/scenarios/${encodeURIComponent(id)}`, json('PUT', data)),
  deleteScenario: (id: string) =>
    send<unknown>(`/scenarios/${encodeURIComponent(id)}`, json('DELETE')),

  sendFeedback: (data: { rating: number; comment?: string; page?: string }) =>
    request<Feedback>('/feedback', json('POST', data)),
  feedbackSummary: () => request<FeedbackSummary>('/feedback'),
  notifyStatus: () => request<NotifyStatus>('/feedback/notify'),
  setNotify: (subscribed: boolean) =>
    request<NotifyStatus>('/feedback/notify', json('PUT', { subscribed })),
  sendTestMail: () =>
    request<{ sent: boolean; to: string }>('/feedback/notify/test', json('POST')),
};
