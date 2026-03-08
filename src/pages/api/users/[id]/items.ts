import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()

  const { id } = req.query
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid user id" })

  const api = createApi(req, res)
  try {
    const apiRes = await api.get(`/auction/v1/users/${id}/items`)
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number } }
    const status = err.response?.status ?? 500
    return res.status(status).json({ error: "ショップ情報の取得に失敗しました" })
  }
}
