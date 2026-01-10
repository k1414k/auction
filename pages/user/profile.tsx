// app/account/page.tsx
import Link from "next/link";
import {useRouter} from "next/navigation";
import { useEffect, useState } from "react";


export default function MyPage() {
    const router = useRouter()
    
    type UserInfoType = {id:number; email:string; name:string; nickname:string}
    const [userInfo, setUserInfo] = useState<UserInfoType>({
      id: 0,
      email: "",
      name: "",
      nickname: ""
    })

    const logoutUser = async () => {
        await fetch('/api/auth/sign-out', {
            method: 'DELETE',
        })

        router.replace("/")
    }
    const getUserInfo = async() => {
      const res = await fetch('/api/auth/user', {
        method: 'GET',
      })
      const data = await res.json()
      setUserInfo(data.user)
    }
    useEffect(()=>{
      getUserInfo()
    },[])
    useEffect(()=>{
      console.log(userInfo);
    }, [userInfo])

  return (
    <div className="px-4 pt-4">
        <section className="relative mb-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="font-semibold">
                  <button className="mr-2 mb-2 py-1.5 px-2 rounded-lg text-xl bg-gray-600 text-white">
                    》{userInfo.nickname}
                  </button>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                    <span>
                      入札中 
                    </span>
                    <span>
                      出品中 
                    </span>
                </div>
            </div>
            <span className="absolute right-3 top-3 text-right">
              <div className="text-blue-500 cursor-pointer">
                住所変更
              </div>
              <div className="text-blue-500 my-1 cursor-pointer">
                パスワード変更
              </div>
              <div className="text-red-500 cursor-pointer" onClick={logoutUser}>
                ログアウト
              </div>
            </span>
        </section>

        <Link href={'/user/wallet'}>
          <section className="mb-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h3 className="font-semibold">財布</h3>
              <h3 className="font-semibold">売上高 50,000¥</h3>
              <h3 className="font-semibold">ポイント 1,000P</h3>
            </div>
          </section>
        </Link>
      <section>
        <h4 className="text-sm font-semibold mb-2">
          入札待機
        </h4>
        <div className="space-y-2">
          <div className="bg-white p-3 rounded-xl shadow-sm">13:20 — 入札終了予定の通知</div>
          <div className="bg-white p-3 rounded-xl shadow-sm">15:00 — 発送予定</div>
        </div>
        <h4 className="text-sm font-semibold mb-2">
          出品中
        </h4>
        <div className="space-y-2">
          該当なし
        </div>
      </section>
    </div>
  );
}
