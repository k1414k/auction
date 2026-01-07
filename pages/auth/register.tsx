// app/register/page.tsx
import AuthLayout from "@/components/AuthLayout";
import {useState} from "react";
import apiServer from "@/lib/axios/server";
import {useRouter} from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()){
      apiServer.post("/auth", form).then((res)=>{
        router.replace("/auth/login")
      }).catch(e=>{
        console.log(e)
        setErrors(["既に加入しているメールアドレスです"]) //<-----------------------------1
      })
    }
    else {
      console.log("フロントバリデーションエラー")
    }
  }


  const validateForm = () => { //異常ない場合true
    const newErrors:string[] = []

    if (form.username.trim().length < 4){
      newErrors.push("ユーザー名は４文字以上必要です")
    }
    if (form.email.trim().length < 4){
      newErrors.push("正しいメールアドレスを入力してください")
    }
    if (form.password.trim().length < 6){
      newErrors.push("パスワードは６文字以上必要です")
    }
    if (form.password != form.password_confirmation){
      newErrors.push("パスワード確認が一致しません")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">新規登録</h1>
      {
        errors.length > 0 &&
        <div className="p-3 bg-red-100 mb-2 text-red-600">
          <ul>
            {errors.map((text, i)=>{
              return (
                <li key={i}>
                  {text}
                </li>
              )
            })}
          </ul>
        </div>
      }
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">ユーザー名</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Your name"
            onChange={e=>setForm({...form, username: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="you@example.com"
            onChange={e=>setForm({...form, email: e.target.value})}
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
        <div>
          <label className="block text-sm mb-1">パスワード確認</label>
          <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              onChange={e=>setForm({...form, password_confirmation: e.target.value})}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          登録する
        </button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-4">
        すでにアカウントがありますか？{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          ログイン
        </a>
      </p>
    </AuthLayout>
  );
}
