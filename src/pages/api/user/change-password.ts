import type { NextApiRequest, NextApiResponse } from 'next'
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).end()
    }

    const api = createRailsApi(req, res)
    try {
        const { currentPassword, newPassword, newPasswordConfirmation } = req.body

        const apiRes = await api.put('/auth', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPasswordConfirmation,
        }, { headers: authHeaders(req) })

        return res.status(200).json({ user: apiRes.data })
    } catch (e: unknown) {
        const err = e as { response?: { data?: unknown } }
        return res.status(401).json({ errors: err.response?.data ?? "パスワードの変更に失敗しました" })
    }
}
