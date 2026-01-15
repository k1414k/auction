import { ReactNode, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import { nextApi } from "@/lib/fetch"

type UserInitailizerProps = {
  children: ReactNode
}

export function UserInitializer({ children }:UserInitailizerProps) {
  const setUser = useUserStore(state => state.setUser)

  useEffect(() => {
    const init = async () => {
      try {
        type UserDataResponse = {
          user: {
            email: string
            name: string
            nickname: string
            balance: number
            points: number
            avatar_url: string
          }
      }
        const userData: UserDataResponse = await nextApi("/auth/user", {method:"GET"})
        console.log(userData);
        
        setUser({
          email: userData.user.email,
          name: userData.user.name,
          nickname: userData.user.nickname,
          balance: userData.user.balance,
          points: userData.user.points,
          avatarUrl: userData.user.avatar_url,
        })

      } catch {
        setUser(null)
      }
    }
    
    init()
  }, [setUser])

  return <>{children}</>
}
