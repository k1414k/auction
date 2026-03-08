import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end()
  }

  try {
    const api = createApi(req, res)
    const apiRes = await api.get("/auction/v1/categories")
    return res.status(200).json({ data: apiRes.data })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return res.status(e.response?.status || 500).json({
        error: e.message,
        baseURL: e.config?.baseURL,
        url: e.config?.url,
        status: e.response?.status,
        data: e.response?.data,
      })
    }
    return res.status(500).json({ error: "unknown error" })
  }
}
