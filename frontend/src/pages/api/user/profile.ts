import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"
import type { User } from "@/types/user"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") return res.status(405).end()

  const introduction = req.body?.introduction
  if (typeof introduction !== "string") {
    return res.status(400).json({ error: "自己紹介を入力してください" })
  }

  const api = createApi(req, res)
  try {
    const apiRes = await api.patch<User>("/auction/v1/user/profile", { introduction })
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string; errors?: string[] } } }
    const status = err.response?.status ?? 500
    const data = err.response?.data
    const message = data?.error ?? data?.errors?.[0] ?? "プロフィール更新に失敗しました"
    return res.status(status).json({ error: message })
  }
}
