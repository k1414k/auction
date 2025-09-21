// app/mypage/page.tsx
export default function MyPage() {
  return (
    <div className="px-4 pt-4">
      <section className="mb-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="font-semibold">マイページ</h3>
          <div className="mt-3 text-sm text-gray-600">入札中 / 出品中 / 券の残高</div>
        </div>
      </section>

      <section className="mb-4">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-sm mb-2">カレンダー（ダミー）</div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center">
            {Array.from({ length: 35 }).map((_,i)=>(
              <div key={i} className={`p-2 rounded ${i===10 ? "bg-sky-50 font-semibold" : "bg-transparent"}`}>{i%30+1}</div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold mb-2">今日の予定</h4>
        <div className="space-y-2">
          <div className="bg-white p-3 rounded-xl shadow-sm">13:20 — 入札終了予定の通知</div>
          <div className="bg-white p-3 rounded-xl shadow-sm">15:00 — 発送予定</div>
        </div>
      </section>
    </div>
  );
}
