const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.detail || message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, opts?: RequestInit) => request<T>(path, { method: "GET", ...opts }),
  post: <T>(path: string, body: unknown, opts?: RequestInit) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...opts }),
  put: <T>(path: string, body: unknown, opts?: RequestInit) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body), ...opts }),
  delete: <T>(path: string, opts?: RequestInit) => request<T>(path, { method: "DELETE", ...opts }),
};

export { ApiError };
