// lib/nextApi.ts
import { useUserStore } from "@/stores/userStore"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export async function nextApi<TRequest = unknown, TResponse = unknown>(
    reqUrl: string,
    options?: {
        method?: HttpMethod
        body?: TRequest
    }
): Promise<TResponse> {
    const res = await fetch(`/api${reqUrl}`, {
        method: options?.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        credentials: "include",
    })

    const text = await res.text()
    let data: unknown = null
    try {
        data = text ? JSON.parse(text) : null
    } catch {
        data = text
    }

    if (!res.ok) {
        if (res.status === 401) {
            useUserStore.getState().clearUser()
        }
        const message =
            data == null
                ? `API Error: ${res.status}`
                : typeof data === "string"
                    ? data
                    : JSON.stringify(data)
        throw new Error(message)
    }

    return data as TResponse
}
