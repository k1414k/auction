// app/wallet/page.tsx
export default function Wallet() {
  const rows = [
    { name: "Ayaka", amount: -1250 },
    { name: "Ryota", amount: +3000 },
    { name: "Kenta", amount: -1200 },
    { name: "Yui", amount: +1000 },
  ];

  return (
    <div className="px-4 pt-4">
      <section className="mb-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">残高</div>
          <div className="text-2xl font-bold mt-1">¥5,000</div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-2 rounded-lg bg-sky-600 text-white">送金</button>
            <button className="flex-1 py-2 rounded-lg bg-gray-100">受け取る</button>
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
