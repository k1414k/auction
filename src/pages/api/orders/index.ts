import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end()

  try {
    const apiRes = await api.post(
      `/v1/orders`,
      req.body,
      {
        headers: {
          "access-token": req.cookies["access-token"],
          client: req.cookies["client"],
          uid: req.cookies["uid"],
        },
      }
    )

    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error ?? "購入処理中にエラーが発生しました"
    return res.status(status).json({ error: message })
  }
}
