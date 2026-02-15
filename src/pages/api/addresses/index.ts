import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

const authHeaders = (req: NextApiRequest) => ({
  "access-token": req.cookies["access-token"] || "",
  client: req.cookies["client"] || "",
  uid: req.cookies["uid"] || "",
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const apiRes = await api.get("/v1/addresses", {
        headers: authHeaders(req),
      })
      return res.status(200).json(apiRes.data)
    } catch (e: unknown) {
      const err = e as { response?: { status: number; data?: unknown } }
      const status = err.response?.status ?? 500
      return res.status(status).json(err.response?.data ?? { error: "一覧の取得に失敗しました" })
    }
  }

  if (req.method === "POST") {
    try {
      const apiRes = await api.post("/v1/addresses", req.body, {
        headers: authHeaders(req),
      })
      return res.status(201).json(apiRes.data)
    } catch (e: unknown) {
      const err = e as { response?: { status: number; data?: { errors?: string[] } } }
      const status = err.response?.status ?? 500
      const message = err.response?.data?.errors?.join(", ") ?? "登録に失敗しました"
      return res.status(status).json({ error: message })
    }
  }

  return res.status(405).end()
}
