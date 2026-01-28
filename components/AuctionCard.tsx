import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";
import Image from "next/image";

type Props = {
    item: Item
}
export function AuctionCard({item}:Props) {
    // spiner

    return (
        <article className="group text-center overflow-hidden transition cursor-pointer mt-3">
            <div className="relative w-full h-40 bg-gray-100 overflow-hidden rounded">

                <div className="absolute top-2 right-2 z-10 bg-black/50 text-white text-sm font-semibold px-2 py-1 rounded-sm">
                    ¥{formatNumber(item.price)}
                </div>

                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw" //修正必要
                    className="
                    rounded-md
                    z-0
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
                <h3 className="text-sm text-slate-800">
                    {item.title}
                </h3>
            </div>
        </article>
    );
}