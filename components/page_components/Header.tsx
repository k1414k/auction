export function Header(){
    return (
      <header className="flex justify-between items-center px-[100px] py-5 border-b border-gray-100 ">
        <div className="text-2xl font-bold text-rose-600">
          AUCTION
        </div>
        <nav className="space-x-4">
          <a href="#" className="text-gray-700 hover:text-blue-500">求人</a>
          <a href="#" className="text-gray-700 hover:text-blue-500">企業情報</a>
          <a href="#" className="text-gray-700 hover:text-blue-500">ログイン</a>
        </nav>
      </header>
    )
}