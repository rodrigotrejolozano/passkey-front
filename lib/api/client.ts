export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001";

export function apiUrl(path: string): string {
  return new URL(path, apiOrigin).toString();
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    throw new ApiError(
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.message ?? "The request could not be completed.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function jsonRequest<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

type CsrfScope = "session" | "recovery";
type CsrfResponse = { data: { csrfToken: string } };

const csrfTokens: Partial<Record<CsrfScope, string>> = {};

async function getCsrfToken(scope: CsrfScope): Promise<string> {
  if (csrfTokens[scope]) return csrfTokens[scope];
  const endpoint =
    scope === "session" ? "/api/auth/csrf" : "/api/recovery/csrf";
  const result = await apiRequest<CsrfResponse>(endpoint);
  csrfTokens[scope] = result.data.csrfToken;
  return result.data.csrfToken;
}

export async function protectedRequest<T>(
  path: string,
  init: RequestInit,
  scope: CsrfScope = "session",
): Promise<T> {
  async function send() {
    const csrfToken = await getCsrfToken(scope);
    return apiRequest<T>(path, {
      ...init,
      headers: { ...init.headers, "X-CSRF-Token": csrfToken },
    });
  }
  try {
    return await send();
  } catch (cause) {
    if (!(cause instanceof ApiError) || cause.code !== "CSRF_INVALID")
      throw cause;
    delete csrfTokens[scope];
    return send();
  }
}

export function protectedJsonRequest<T>(
  path: string,
  body: unknown,
  scope: CsrfScope = "session",
): Promise<T> {
  return protectedRequest<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    scope,
  );
}
