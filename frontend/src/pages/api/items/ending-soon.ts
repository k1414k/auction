import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const apiRes = await api.get("/auction/v1/items/ending_soon")
    return res.status(200).json(apiRes.data)
  } catch {
    return res.status(500).json({ error: "取得に失敗しました" })
  }
}
