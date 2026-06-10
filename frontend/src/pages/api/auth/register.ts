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
    const { name, email, password, password_confirmation } = req.body
    const api = createApi(req, res)
    const apiRes = await api.post("/auth", {
      name,
      email,
      password,
      password_confirmation,
    })
    const userData = (apiRes.data as { data?: unknown })?.data ?? apiRes.data
    return res.status(200).json({ user: userData })
  } catch (e) {
    return res.status(401).json({ e })
  }
}

