import { nextApi } from "@/lib/fetch";
import { useUserStore } from "@/stores/userStore";
import { formatNumber } from "@/utils/format-number";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import { useState } from "react";


export default function MyPage() {
    const router = useRouter()
    const user = useUserStore(state=>state.user)
    const setUser = useUserStore(state=>state.setUser)

    const uploadAvatar = async (file: File) => {
      if (!user) return

      const formData = new FormData()
      formData.append("avatar", file)


      try {
        const res = await fetch(`/api/user/change-avatar`, {
          method: "PATCH",
          body: formData,
          credentials: "include", // cookie 認証
        });

        if (!res.ok) throw new Error("upload failed");

        const data = await res.json()

        setUser({
          ...user,
          avatarUrl: data.avatar_url,
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
        else router.refresh()
      }

      catch {
        alert("fail")
      }
    }
    const onChangePassword = async() => {
      try {

        await nextApi("/user/change-password", {
          method: "PUT",
          body: passwordForm
        })

        console.log("success");
      }

      catch {
        alert("fail")
      }
    }
    const logoutUser = async () => {
      try{
        await nextApi('/auth/sign-out', {
          method: 'DELETE',
        })
        router.replace("/")
      }
      catch{
        alert("fail")
      }
    }


  return (
    <div className="px-4 pt-4">
        {modalSwitch && (
          <div className="fixed z-50 flex items-center justify-center inset-0">
            <div className="absolute bg-white/90 p-6 
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            rounded-md shadow-md">
              <button onClick={()=>{setModalSwitch(!modalSwitch)}}>
                モーダルonoff
              </button>
              <div className="p-10">
                <input type="password" placeholder="currentpassword" onChange={e=>setPasswordForm({...passwordForm, currentPassword: e.target.value})}/>
                <input type="password" placeholder="newpassword" onChange={e=>setPasswordForm({...passwordForm, newPassword: e.target.value})}/>
                <input type="password" placeholder="newpasswordconfirm" onChange={e=>setPasswordForm({...passwordForm, newPasswordConfirmation: e.target.value})}/>
                <div className="mt-4 bg-indigo-200 p-2 cursor-pointer" onClick={onChangePassword}>
                  パスワード変更
                </div>
              </div>
            </div>
          </div>
        )}{nicknameModal && (
          <div className="fixed z-50 flex items-center justify-center inset-0">
            <div className="absolute bg-white/90 p-6 
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            rounded-md shadow-md">
              <button onClick={()=>{setNicknameModal(!nicknameModal)}}>
                モーダルonoff
              </button>
              <div className="p-10">
                <input type="text" placeholder="新しいニックネーム入力" onChange={e=>setNewNickname(e.target.value)}/>
                <div className="mt-4 bg-indigo-200 p-2 cursor-pointer" onClick={onChangeNicknmae}>
                  ニックネーム変更
                </div>
              </div>
            </div>
          </div>
        )}
        <section className="relative mb-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="font-semibold flex items-center ">
                  <Image
                    src={user?.avatarUrl || "/apple.png"}
                    alt="avatar"
                    width={50}
                    height={50} // height-autoになっている
                    className="rounded-md"
                  />
                  <button className="mx-2 py-1.5 px-2 rounded-lg text-xl bg-gray-600 text-white"
                    onClick={()=>setNicknameModal(!nicknameModal)}
                  >
                    》{user?.nickname}
                  </button>
                 </div>
                <div className="mt-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e=>{
                            const file = e.target.files?.[0]
                            if (file) uploadAvatar(file)
                        }}
                    />
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
              <div className="text-blue-500 my-1 cursor-pointer" onClick={()=>{
                setModalSwitch(true)
              }}>
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
              <h3 className="font-semibold">売上高 {user?.balance ? formatNumber(user.balance) : 0} ¥</h3>
              <h3 className="font-semibold">ポイント {user?.points ? formatNumber(user.points) : 0} P</h3>
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
