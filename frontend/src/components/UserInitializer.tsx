import { ReactNode, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import { nextApi } from "@/lib/fetch"
import { User } from "@/types/user"

type UserInitailizerProps = {
  children: ReactNode
}

// リロード時にサーバーセッションから user を取得し zustand に保存するコンポーネント。
// 依存配列を [] にすることで mount 時のみ実行する。
// login / register / logout は各ページが直接 setUser() を呼ぶため
// ルート変化のたびに再実行する必要はない。再実行すると auth/user が失敗した瞬間に
// setUser(null) でユーザー状態が競合して上書きされるバグが起きる。
export function UserInitializer({ children }:UserInitailizerProps) {
  const setUser = useUserStore(state => state.setUser)
  const clearUser = useUserStore(state => state.clearUser)
  const setLoading = useUserStore(state => state.setLoading)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        type UserDataResponse = {
          user: User
        }
        const userData: UserDataResponse = await nextApi("/auth/user", {method:"GET"})
        setUser(userData.user)
      } catch {
        clearUser()
      }
    }
    init()
  }, [clearUser, setLoading, setUser])

  return <>{children}</>
}
