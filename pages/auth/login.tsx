import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation"


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState('')
  const formData = {
    email: email,
    password: password,
  }
  // useEffect(() => {
  //   const check = async () => {
  //     const res = await fetch("/api/auth/validate")
  //
  //     if (res.ok) router.replace("/")
  //   }
  //
  //   check()
  // }, [])

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setErrors("")

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: "include", // ← これ

      })

      if (!res.ok) {
        throw new Error()
      }

      router.replace('/')
    } catch {
      setErrors("メールアドレスとパスワードが違います")
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
            onChange={e=>setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">パスワード</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            onChange={e=>setPassword(e.target.value)}
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
