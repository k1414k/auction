import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid id" })

  if (req.method !== "PATCH") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const apiRes = await api.patch(`/auction/v1/offers/${id}`, req.body)
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error ?? "処理に失敗しました"
    return res.status(status).json({ error: message })
  }
}
