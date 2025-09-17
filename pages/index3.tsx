import Image from "next/image";

const items = [
  {
    id: 1,
    name: "ノートパソコン",
    price: 29800,
    endsIn: "2日",
    img: "/laptop.png",
  },
  {
    id: 2,
    name: "スマートフォン",
    price: 25000,
    endsIn: "5日",
    img: "/phone.png",
  },
  {
    id: 4,
    name: "タブレット",
    price: 18000,
    endsIn: "1日",
    img: "/tablet.png",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">Auction</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="検索..."
            className="border rounded-lg px-3 py-2 text-sm focus:outline-blue-500"
          />
          <button className="text-sm font-medium text-gray-700">ログイン</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            出品
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r p-6">
          <h2 className="font-semibold mb-4">カテゴリ</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><input type="checkbox" /> <span className="ml-2">PC</span></li>
            <li><input type="checkbox" /> <span className="ml-2">スマホ</span></li>
            <li><input type="checkbox" /> <span className="ml-2">タブレット</span></li>
            <li><input type="checkbox" /> <span className="ml-2">周辺機器</span></li>
          </ul>
          <h2 className="font-semibold mt-6 mb-2">価格</h2>
          <input type="range" className="w-full" />
          <h2 className="font-semibold mt-6 mb-2">状態</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><input type="checkbox" /> <span className="ml-2">新品同様</span></li>
            <li><input type="checkbox" /> <span className="ml-2">中古</span></li>
          </ul>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-8">
          <h2 className="text-xl font-bold mb-6">オークション</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
              >
                <Image
                  src={item.img}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-contain bg-gray-100"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-lg font-bold text-blue-600">
                    ¥{item.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">終了まで {item.endsIn}</p>
                  <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    入札する
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
