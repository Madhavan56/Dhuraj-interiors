export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const isForm = body instanceof FormData;

  const response = await fetch(path, {
    method,
    signal,
    credentials: "same-origin",
    headers: isForm || body === undefined ? undefined : { "Content-Type": "application/json" },
    body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string; fields?: Record<string, string> }
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error ?? "Something went wrong. Please try again.",
      response.status,
      payload?.fields,
    );
  }

  return payload as T;
}
