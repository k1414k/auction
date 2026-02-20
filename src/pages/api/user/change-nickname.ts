import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).end()
  }

  const api = createRailsApi(req, res)
  try {
    const { nickname } = req.body

    const apiRes = await api.put(
      "/auth",
      { nickname: nickname },
      { headers: authHeaders(req) }
    )
    return res.status(200).json({ user: apiRes.data.data })
  } catch {
    return res.status(401).json({ error: "ニックネームの更新に失敗しました" })
  }
}
