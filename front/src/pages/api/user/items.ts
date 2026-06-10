import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const apiRes = await api.get("/auction/v1/user/items")
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number } }
    const status = err.response?.status ?? 500
    return res.status(status).json({ error: "商品一覧の取得に失敗しました" })
  }
}
