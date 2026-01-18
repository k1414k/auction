// components/AuctionCard.tsx
import Image from "next/image";

export function AuctionCard({ item }) {
    return (
        <article className="group text-center overflow-hidden transition cursor-pointer mt-3">
            <div className="absolute top-2 right-2 z-10 bg-black/80 text-white text-sm font-semibold px-2 py-1 ">
                ¥{item.price}
            </div>
            <div className="relative w-full h-40 bg-gray-100 overflow-hidden ">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="
                    rounded
                    object-cover
                    p-2
                    transition-transform
                    duration-300
                    scale-110
                    group-hover:scale-105
              "
                />
            </div>
            <div className="p-1.5 text-xs">
                <h3 className=" text-sm text-slate-800">
                    {item.name}
                </h3>
            </div>
        </article>

);
}
