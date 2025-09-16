import Image from "next/image";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function Header(){
    return (
      <header className="grid grid-cols-10 items-center justify-end bg-gradient-to-l from-gray-700 to-gray-900">
        <div className="col-span-1 col-start-2 text-2xl font-black text-purple-200 ">
          <div className="cursor-pointer border-purple-200 border p-1 text-center rounded-3xl">
            <div className="cursor-pointer bg-white text-purple-700 border-purple-200 border p-1 text-center rounded-3xl">
              <div className="xm:text-blue-500 xs:text-red-500">
                test
              </div>
              Auction ✴︎
            </div>
          </div>
        </div>
        <div className="col-span-5 col-start-3 ml-5 ">
          <div className="grid grild-cols-10 items-center justify-center">
            <Image src={'/search.png'} className="col-span-1 col-start-1" alt="asd" width={30} height={30}></Image>
            <input
              placeholder="ここを押して探しているモデル名入力. iphone, Macbook ..." 
              className="
              col-span-6 col-start-2
              border border-gray-300 rounded-lg px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="
            col-span-2 col-start-8
            inline-block">
              検索
            </span>
          </div>
        </div>
        <nav className="col-span-3 col-start-8 space-x-4 py-3"> 
          <div className="text-end mr-5">
            <a href="#" className="text-white hover:text-blue-500">
              <Button variant="secondary" size="md">
                ログイン
              </Button>
            </a>
            <a href="#" className="text-white hover:text-blue-500">
              <Button variant="secondary" size="md">
                ⭐️ リスト 0
              </Button>
            </a>
            <a href="#" className="text-white hover:text-blue-500">
              <Button variant="secondary" size="md">
                三
              </Button>
            </a>
          </div>
        </nav>
      </header>
    )
}