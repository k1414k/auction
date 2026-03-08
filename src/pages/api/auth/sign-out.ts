import type { NextApiRequest, NextApiResponse } from "next"
import { createApi, clearAuthCookies } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).end()
  }

  const api = createApi(req, res)
  try {
    await api.delete("/auth/sign_out")
  } catch {
    // 401 等でもログアウトは成功扱い
  }
  clearAuthCookies(res)
  return res.status(200).json({ message: "signed out" })
}
