import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  try {
    const { email, password } = req.body
    const api = createApi(req, res)
    const apiRes = await api.post("/auth/sign_in", { email, password })
    return res.status(200).json({ user: apiRes.data.data })
  } catch {
    return res.status(401).json({
      message: "メールアドレスまたはパスワードが違います",
    })
  }
}
