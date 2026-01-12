import { nextApi } from "@/lib/fetch";
import { useUserStore } from "@/stores/userStore";
import { formatNumber } from "@/utils/format-number";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Wallet() {
  const router = useRouter()
  const user = useUserStore(state=>state.user)
  const setUser = useUserStore(state=>state.setUser)
  const [onModal,setOnModal] = useState("")
  const [form,setForm] = useState({
    type: "",
    amount: 0
  })
  useEffect(()=>{
    if (onModal == "売上") setForm(prev=>({...prev, type: "balance"}))
    if (onModal == "ポイント") setForm(prev=>({...prev, type: "points"}))
  }, [onModal])
  
  const handleSubmit = async() => {
    setOnModal("")
    try {
      await nextApi("/user/change-wallet", {
        method: "PATCH",
        body: form
      })
      if (user){
        form.type === "balance" ? 
        setUser({...user, balance: user.balance + form.amount}) : 
        setUser({...user, points: user.points + form.amount})
      } 
      else router.refresh()
    }
    catch {
      console.log("失敗");
      // ここに何かの操作でご入力と対策必要
      //　及びバリデーションも必要
      // 条件は 0入力、残高がマイナスになる、１００００００くらいの大きい数字はいる
    }
  }
  const rows = [
    { name: "Ayaka", amount: -1250 },
    { name: "Ryota", amount: +3000 },
  ];

  return (
    <div className="px-4 pt-4">
      {
        onModal != "" && (
          <div className="z-50 inset-0 fixed flex justify-center items-center">
            <div className="p-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm bg-black/40">
              <div onClick={()=>setOnModal("")} className="cursor-pointer">
                close
              </div>
              <div>
                <input type="number" onChange={(e)=>setForm(prev=>({...prev, amount: Number(e.target.value)}))} />
              </div>
              <div>
                <button onClick={handleSubmit}>submit</button>
              </div>
            </div>
          </div>
        )
      }
      <section className="mb-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">売上高・ポイント</div>
          <div className="text-2xl font-bold mt-1">
            ¥ { user?.balance ? formatNumber(user.balance) : 0 }
            ・
            P { user?.points ? formatNumber(user.points) : 0 }
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-2 rounded-lg bg-sky-600 text-white"
              onClick={()=>setOnModal("売上")}>売上</button>
            <button className="flex-1 py-2 rounded-lg bg-gray-100"
              onClick={()=>setOnModal("ポイント")}
            >ポイント</button>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold mb-2">送金履歴</h4>
        <div className="space-y-2">
          {rows.map((r, idx) => (
            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm flex justify-between">
              <div>{r.name}</div>
              <div className={`font-medium ${r.amount > 0 ? "text-green-600" : "text-rose-600"}`}>
                {r.amount > 0 ? "+" : "-"}¥{Math.abs(r.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
