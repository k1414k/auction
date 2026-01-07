import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Cookieの存在チェック（中身は見ない）
    const hasAuthCookie =
        req.cookies.has("access-token") &&
        req.cookies.has("client") &&
        req.cookies.has("uid")

    /**
     * =========================
     * ① ユーザーの権限(ログイン必要)なページにアクセスした場合
     * =========================
     */
    const protectedPaths = [
        "/list",
        "/settings",
        "/items/new",
    ]

    const isProtected = protectedPaths.some(path =>
        pathname.startsWith(path)
    )

    if (isProtected && !hasAuthCookie) {
        return NextResponse.redirect(
            new URL("/auth/login", req.url)
        )
    }

    /**
     * =========================
     * ② ログイン済みでログイン関連画面に来た場合
     * =========================
     */
    if (pathname === "/auth/login" && hasAuthCookie) {
        return NextResponse.redirect(
            new URL("/", req.url)
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api|_next|favicon.ico).*)",
    ],
}
