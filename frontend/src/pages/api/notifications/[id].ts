import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid notification id" })
  if (req.method !== "PATCH") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const apiRes = await api.patch(`/auction/v1/notifications/${id}`)
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    return res.status(err.response?.status ?? 500).json({
      error: err.response?.data?.error ?? "通知の更新に失敗しました",
    })
  }
}
