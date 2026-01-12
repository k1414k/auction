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
          }
      }
        const userData: UserDataResponse = await nextApi("/auth/user", {method:"GET"})
        setUser(userData.user)
      } catch {
        setUser(null)
      }
    }
    init()
  }, [setUser])

  return <>{children}</>
}
