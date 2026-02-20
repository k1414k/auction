import type { NextApiRequest, NextApiResponse } from 'next'
import api from "@/lib/axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        return res.status(405).end()
    }

    // トークン期限切れ等でRailsが失敗しても、必ずローカルCookieは削除する
    const accessToken = req.cookies['access-token']
    const client = req.cookies['client']
    const uid = req.cookies['uid']

    if (accessToken && client && uid) {
        try {
            await api.delete('/auth/sign_out', {
                headers: { 'access-token': accessToken, client, uid },
            })
        } catch {
            // 401等で失敗しても無視。トークン期限切れでもログアウトは成功扱い
        }
    }

    res.setHeader('Set-Cookie', [
        'access-token=; Path=/; HttpOnly; Max-Age=0',
        'client=; Path=/; HttpOnly; Max-Age=0',
        'uid=; Path=/; HttpOnly; Max-Age=0',
    ])
    return res.status(200).json({ message: 'signed out' })
}
