import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Cookieの存在チェック（中身は見ない）
    const hasAuthCookie =
        req.cookies.has("access-token") &&
        req.cookies.has("client") &&
        req.cookies.has("uid")

    // 1:: ユーザーの権限(ログイン必要)なページにアクセスした場合
    const protectedPaths = [
        "/user",
    ]
    const isProtected = protectedPaths.some(path => // protectedPathsが入った経路は遮断される
        pathname.startsWith(path)
    )
    if (isProtected && !hasAuthCookie) {
        return NextResponse.redirect(
            new URL("/auth/sign-in", req.url)
        )
    }
    /////////////ここまで１///////////////////

    // 2:: ログイン済みでログイン関連画面にアクセスした場合
    const protectedAuthPaths = [
        "/auth",
    ]
    const isAuthProtected = protectedAuthPaths.some(path =>
        pathname.startsWith(path)
    )

    if (isAuthProtected && hasAuthCookie) {
        return NextResponse.redirect(
            new URL("/", req.url)
            )
        }

        return NextResponse.next()
    }
    /////////////ここまで２///////////////////


export const config = {
    matcher: [
        "/((?!api|_next|favicon.ico).*)",
    ],
}
