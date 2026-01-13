import type { NextApiRequest, NextApiResponse } from 'next'
import api from "@/lib/axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        return res.status(405).end()
    }

    try {
        // 🍪 ブラウザから送られてきた Cookie を取得
        const accessToken = req.cookies['access-token']
        const client = req.cookies['client']
        const uid = req.cookies['uid']

        if (!accessToken || !client || !uid) {
            return res.status(401).json({ message: '認証情報がありません' })
        }

        await api.delete('/auth/sign_out', {
            headers: {
                'access-token': accessToken,
                client,
                uid,
            },
        })

        // 🧹 Cookie を削除（即時失効）
        res.setHeader('Set-Cookie', [
            'access-token=; Path=/; HttpOnly; Max-Age=0',
            'client=; Path=/; HttpOnly; Max-Age=0',
            'uid=; Path=/; HttpOnly; Max-Age=0',
        ])

        return res.status(200).json({ message: 'signed out' })
    } catch (error) {
        return res.status(500).json({
            message: 'ログアウトに失敗しました',
        })
    }
}
