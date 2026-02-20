import axios, { type AxiosInstance } from "axios"
import type { NextApiRequest, NextApiResponse } from "next"

const COOKIE_CLEAR_HEADERS = [
  "access-token=; Path=/; HttpOnly; Max-Age=0",
  "client=; Path=/; HttpOnly; Max-Age=0",
  "uid=; Path=/; HttpOnly; Max-Age=0",
]

/** 401 時に Cookie をクリアする Set-Cookie ヘッダを設定 */
export function clearAuthCookies(res: NextApiResponse): void {
  res.setHeader("Set-Cookie", COOKIE_CLEAR_HEADERS)
}

/** Rails API 呼び出し用の axios インスタンス。401 時に自動で Cookie をクリア */
export function createRailsApi(req: NextApiRequest, res: NextApiResponse): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  })

  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        clearAuthCookies(res)
      }
      return Promise.reject(err)
    }
  )

  return instance
}

/** 認証ヘッダを取得。Cookie が無い場合は空オブジェクト */
export function authHeaders(req: NextApiRequest): Record<string, string> {
  const token = req.cookies["access-token"]
  const client = req.cookies["client"]
  const uid = req.cookies["uid"]
  if (token && client && uid) {
    return { "access-token": token, client, uid }
  }
  return {}
}
