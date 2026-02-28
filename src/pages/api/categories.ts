import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"
import axios from "axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end()
  }

  try {
    const apiRes = await api.get("/auction/v1/categories")
    return res.status(200).json({ data: apiRes.data })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error("categories error:", e.message, e.config?.baseURL, e.response?.status)
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