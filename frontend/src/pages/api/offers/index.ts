import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const apiRes = await api.get("/auction/v1/offers")
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    return res.status(err.response?.status ?? 500).json({ error: err.response?.data?.error ?? "オファー一覧の取得に失敗しました" })
  }
}
