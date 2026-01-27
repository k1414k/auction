import { ReactNode, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import { nextApi } from "@/lib/fetch"
import { User } from "@/types/user"

type UserInitailizerProps = {
  children: ReactNode
}

//リロード時にuser取得してzustand:userStoreに保存用途コンポ
export function UserInitializer({ children }:UserInitailizerProps) {
  const setUser = useUserStore(state => state.setUser)

  useEffect(() => {
    const init = async () => {
      try {
        type UserDataResponse = {
          user: User
      }
        const userData: UserDataResponse = await nextApi("/auth/user", {method:"GET"})
        console.log(userData);
        
        setUser({
          email: userData.user.email,
          name: userData.user.name,
          nickname: userData.user.nickname,
          balance: userData.user.balance,
          points: userData.user.points,
          introduction: userData.user.introduction,
          avatar_url: userData.user.avatar_url,
          role: userData.user.role,
        })

      } catch {
        setUser(null)
      }
    }
    
    init()
  }, [setUser])

  return <>{children}</>
}
