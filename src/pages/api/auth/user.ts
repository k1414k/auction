import type { NextApiRequest, NextApiResponse } from 'next'
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).end()
    }

    const api = createRailsApi(req, res)
    try {
        const apiRes = await api.get('/v1/user', {
            headers: authHeaders(req),
        })
        return res.status(200).json({ user: apiRes.data })
    } catch {
        return res.status(401).json({
            error: "Unauthorized",
            message: "認証に失敗しました。再度ログインしてください。",
        })
    }
}
