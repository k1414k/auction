import { nextApi } from "@/lib/fetch";
import { useUserStore } from "@/stores/userStore";
import { formatNumber } from "@/utils/format-number";
import {
  Banknote,
  Coins,
  Edit3,
  KeyRound,
  LogOut,
  MapPin,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function MyPage() {
    const router = useRouter()
    const user = useUserStore(state=>state.user)
    const setUser = useUserStore(state=>state.setUser)
    const [instroEdit, setInstroEdit] = useState(false)

    const uploadAvatar = async (file: File) => {
      if (!user) return

      const formData = new FormData()
      formData.append("avatar", file)


      try {
        const res = await fetch(`/api/user/change-avatar`, {
          method: "PATCH",
          body: formData,
        });

        if (!res.ok) throw new Error("upload failed");

        const data = await res.json()

        setUser({
          ...user,
          avatar_url: data.avatar_url,
        });
      } catch (e) {
        alert("画像アップロードに失敗しました")
        console.error(e)
      }
    };
    const [modalSwitch, setModalSwitch] = useState(false)
    const [nicknameModal, setNicknameModal] = useState(false)
    const [newNickname, setNewNickname] = useState("")
    const [passwordForm, setPasswordForm] = useState({
      currentPassword: "",
      newPassword: "",
      newPasswordConfirmation: ""
    })
    const onChangeNicknmae = async() => {
      try {
        await nextApi("/user/change-nickname", {
          method: "PUT",
          body: {
            nickname: newNickname
          }
        })
        setNicknameModal(false)
        if (user) setUser({...user, nickname: newNickname}) //storeに保存
        else router.reload()
      }

      catch {
        alert("ニックネームの変更に失敗しました")
      }
    }
    const onChangePassword = async() => {
      try {
        await nextApi("/user/change-password", {
          method: "PUT",
          body: passwordForm
        })
        setModalSwitch(false)
        setPasswordForm({ currentPassword: "", newPassword: "", newPasswordConfirmation: "" })
      } catch {
        alert("パスワードの変更に失敗しました")
      }
    }
    const logoutUser = async () => {
      try{
        await nextApi('/auth/sign-out', {
          method: 'DELETE',
        })
        router.replace("/")
      }
      catch {
        alert("ログアウトに失敗しました")
      }
    }


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="h-14 bg-white flex items-center px-4 border-b sticky top-0 z-10">
        <h1 className="flex-1 text-center font-bold text-gray-800">プロフィール</h1>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6">
        {modalSwitch && (
          <div className="fixed z-50 flex items-center justify-center inset-0 bg-black/40" onClick={() => setModalSwitch(false)}>
            <div
              className="bg-white rounded-2xl shadow-xl p-6 mx-4 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">パスワード変更</h2>
                <button
                  onClick={() => setModalSwitch(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="現在のパスワード"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="新しいパスワード"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="新しいパスワード（確認）"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPasswordConfirmation: e.target.value })}
                />
              </div>
              <button
                onClick={onChangePassword}
                className="w-full mt-4 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
              >
                変更する
              </button>
            </div>
          </div>
        )}
        {nicknameModal && (
          <div className="fixed z-50 flex items-center justify-center inset-0 bg-black/40" onClick={() => setNicknameModal(false)}>
            <div
              className="bg-white rounded-2xl shadow-xl p-6 mx-4 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">ニックネーム変更</h2>
                <button
                  onClick={() => setNicknameModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <input
                type="text"
                placeholder="新しいニックネーム"
                value={newNickname}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <button
                onClick={onChangeNicknmae}
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
              >
                変更する
              </button>
            </div>
          </div>
        )}
        <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-start gap-4">
            <label className="relative group cursor-pointer shrink-0">
              <Image
                src={user?.avatar_url || "/apple.png"}
                alt="avatar"
                width={72}
                height={72}
                className="rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Edit3 size={20} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                }}
              />
            </label>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => {
                  setNewNickname(user?.nickname ?? "");
                  setNicknameModal(true);
                }}
                className="flex items-center gap-1.5 text-lg font-bold text-gray-800 hover:text-blue-600 transition group"
              >
                {user?.nickname || "ニックネーム未設定"}
                <Edit3 size={14} className="text-gray-400 group-hover:text-blue-600" />
              </button>
              <div className="mt-2">
                {instroEdit ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full h-24 p-3 text-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="自己紹介"
                    />
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                      onClick={() => setInstroEdit(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <p
                    className="text-gray-600 text-sm leading-relaxed cursor-pointer hover:text-gray-800 transition py-1"
                    onClick={() => setInstroEdit(true)}
                  >
                    {user?.introduction || "自己紹介を追加する"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 text-xs">
              {["入札中", "出品中", "購入履歴", "販売履歴", "ポイント履歴"].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
            <button
              type="button"
              className="flex items-center gap-2 py-2 text-blue-600 font-medium hover:text-blue-700 transition text-left"
            >
              <MapPin size={16} />
              住所変更
            </button>
            <button
              onClick={() => setModalSwitch(true)}
              className="flex items-center gap-2 py-2 text-blue-600 font-medium hover:text-blue-700 transition text-left"
            >
              <KeyRound size={16} />
              パスワード変更
            </button>
            <button
              onClick={logoutUser}
              className="flex items-center gap-2 py-2 text-red-600 font-medium hover:text-red-700 transition text-left"
            >
              <LogOut size={16} />
              ログアウト
            </button>
          </div>
        </section>

        <Link href="/user/wallet">
          <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition group">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Banknote size={20} className="text-amber-500" />
              ウォレット
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">売上高</p>
                <p className="text-lg font-bold text-gray-800">¥ {user?.balance ? formatNumber(user.balance) : 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">ポイント</p>
                <p className="text-lg font-bold text-gray-800">{user?.points ? formatNumber(user.points) : 0} P</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-blue-600 font-medium group-hover:text-blue-700 flex items-center gap-1">
              詳細を見る
              <Coins size={14} />
            </p>
          </section>
        </Link>

        <section>
          <h4 className="text-sm font-bold text-gray-800 mb-3">入札待機</h4>
          <div className="space-y-2">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-gray-500 text-sm">13:20</span>
              <span className="ml-2 text-gray-800">入札終了予定の通知</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-gray-500 text-sm">15:00</span>
              <span className="ml-2 text-gray-800">発送予定</span>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-sm font-bold text-gray-800 mb-3">出品中</h4>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            該当なし
          </div>
        </section>
      </main>
    </div>
  );
}
