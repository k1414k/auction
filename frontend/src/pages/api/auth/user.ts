import type { NextApiRequest, NextApiResponse } from "next"
import { clearAuthCookies, createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end()
  }

  const hasAuthCookies =
    Boolean(req.cookies["access-token"]) &&
    Boolean(req.cookies["client"]) &&
    Boolean(req.cookies["uid"])

  if (!hasAuthCookies) {
    clearAuthCookies(res)
    return res.status(401).json({
      error: "Unauthorized",
      message: "認証情報がありません。",
    })
  }

  const api = createApi(req, res)
  try {
    const apiRes = await api.get("/auction/v1/user")
    return res.status(200).json({ user: apiRes.data })
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
      message: "認証に失敗しました。再度ログインしてください。",
    })
  }
}
