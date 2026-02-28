import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(405).end()

    const api = createRailsApi(req, res)
    try {
      const apiRes = await api.post(`/auction/v1/orders`, req.body ?? {}, {
        headers: authHeaders(req),
      })
      return res.status(200).json({ data: apiRes.data })
    } catch {
      return res.status(401).json({ error: "注文処理に失敗しました" })
    }
}
