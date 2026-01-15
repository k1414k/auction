import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation"
import {nextApi} from "@/lib/fetch";
import { useUserStore } from "@/stores/userStore";


type UserDataResponse = {
  user: {
    email: string
    name: string
    nickname: string
    balance: number
    points: number
    introduction: string
    avatar_url: string
  }
}

export default function LoginPage() {
  const router = useRouter()
  const setUser = useUserStore(state=>state.setUser)
  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [errors, setErrors] = useState('')
  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors("")

    try {
      await nextApi("/auth/sign-in", {
        method: "POST",
        body: form,
      })

      const userData: UserDataResponse = await nextApi("/auth/user", {method:"GET"})
        // ログイン成功したのでユーザー情報取得後zustandに入れる もし失敗したらcatchに飛ぶので可能
      setUser({
          email: userData.user.email,
          name: userData.user.name,
          nickname: userData.user.nickname,
          balance: userData.user.balance,
          points: userData.user.points,
          introduction: userData.user.introduction,
          avatarUrl: userData.user.avatar_url,
        })

        router.replace('/')
      } 
    catch (e){
      if (e instanceof Error){
        const errorMessage= JSON.parse(e.message)
        setErrors(errorMessage.message)
      }
      else {
        setErrors("ログイン失敗しました。")
      }
    }
  }


  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
      <form className="space-y-4" onSubmit={handleSubmit} >
        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="your@example.com"
            onChange={e=>setForm({...form, email: (e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">パスワード</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            onChange={e=>setForm({...form, password: e.target.value})}
          />
        </div>
        <button
            type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ログイン
        </button>
      </form>
      {
        errors != '' &&
        <div className={"text-red-500 mt-2 text-center"}>
          {errors}
        </div>
      }
      <div className="text-sm text-center text-gray-600 mt-4 space-y-1">
        <p>
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            パスワードをお忘れですか？
          </Link>
        </p>
        <p>
          アカウントがない？{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
