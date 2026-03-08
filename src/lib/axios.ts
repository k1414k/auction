import axios, { type AxiosInstance, type AxiosResponseHeaders } from "axios"
import type { NextApiRequest, NextApiResponse } from "next"

const COOKIE_OPTIONS = "Path=/; HttpOnly; SameSite=Lax"
const COOKIE_CLEAR_HEADERS = [
  `access-token=; ${COOKIE_OPTIONS}; Max-Age=0`,
  `client=; ${COOKIE_OPTIONS}; Max-Age=0`,
  `uid=; ${COOKIE_OPTIONS}; Max-Age=0`,
]

function cookieBaseOptions(): string {
  const isProd = process.env.NODE_ENV === "production"
  return isProd
    ? "Path=/; HttpOnly; Secure; SameSite=None"
    : "Path=/; HttpOnly; SameSite=Lax"
}

/** 401 時またはログアウト時に Cookie をクリア */
export function clearAuthCookies(res: NextApiResponse): void {
  res.setHeader("Set-Cookie", COOKIE_CLEAR_HEADERS)
}

/** Rails のレスポンスヘッダから認証情報を Cookie に保存 */
function setAuthCookiesFromRailsHeaders(
  res: NextApiResponse,
  headers: AxiosResponseHeaders | Record<string, unknown>
): void {
  const accessToken = headers["access-token"]
  const client = headers["client"]
  const uid = headers["uid"]

  if (
    typeof accessToken !== "string" ||
    typeof client !== "string" ||
    typeof uid !== "string"
  ) {
    return
  }

  const base = cookieBaseOptions()

  res.setHeader("Set-Cookie", [
    `access-token=${encodeURIComponent(accessToken)}; ${base}`,
    `client=${encodeURIComponent(client)}; ${base}`,
    `uid=${encodeURIComponent(uid)}; ${base}`,
  ])
}

/** Next API Route から Rails を叩くための baseURL（内部用） */
function resolveRailsBaseUrl(): string {
  const baseUrl =
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3000"
  return baseUrl.replace(/\/$/, "")
}

/** Cookie から認証ヘッダを生成 */
function authHeadersFromRequest(req: NextApiRequest): Record<string, string> {
  const token = req.cookies["access-token"]
  const client = req.cookies["client"]
  const uid = req.cookies["uid"]
  if (!token || !client || !uid) return {}
  return { "access-token": token, client, uid }
}

/**
 * Next API Route 用の Rails 呼び出し axios インスタンス
 * - baseURL: INTERNAL_API_BASE_URL（内部向け）
 * - リクエストに Cookie 由来の認証ヘッダを自動付与
 * - Rails のレスポンスで認証ヘッダがあれば Set-Cookie に反映
 * - 401 時は Cookie をクリア
 */
export function createApi(
  req: NextApiRequest,
  res: NextApiResponse
): AxiosInstance {
  const instance = axios.create({
    baseURL: resolveRailsBaseUrl(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  })

  instance.interceptors.request.use((config) => {
    const auth = authHeadersFromRequest(req)
    if (Object.keys(auth).length) {
      config.headers = { ...config.headers, ...auth } as typeof config.headers
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => {
      setAuthCookiesFromRailsHeaders(res, response.headers)
      return response
    },
    (err) => {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          clearAuthCookies(res)
        }
        if (err.response?.headers) {
          setAuthCookiesFromRailsHeaders(res, err.response.headers)
        }
      }
      return Promise.reject(err)
    }
  )

  return instance
}
