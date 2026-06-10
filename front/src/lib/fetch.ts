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

    if (!res.ok) {
        if (res.status === 401) {
            useUserStore.getState().setUser(null)
        }
        const message = await res.text()
        throw new Error(message || `API Error: ${res.status}`)
    }

    return await res.json() as Promise<TResponse>
}
