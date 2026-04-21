import type { ApiErrorResponse } from "@/lib/api/contracts";

type JsonValue = string | number | boolean | null | JsonValue[] | {
  [key: string]: JsonValue;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? ((await response.json()) as TResponse | ApiErrorResponse)
    : ((await response.text()) as JsonValue);

  if (!response.ok) {
    if (isApiError(payload)) {
      throw new ApiClientError(
        payload.error.message,
        response.status,
        payload.error.code,
      );
    }

    throw new ApiClientError("Request failed.", response.status);
  }

  return payload as TResponse;
}

function isApiError(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const error = Reflect.get(value, "error");

  return (
    !!error &&
    typeof error === "object" &&
    typeof Reflect.get(error, "code") === "string" &&
    typeof Reflect.get(error, "message") === "string"
  );
}
