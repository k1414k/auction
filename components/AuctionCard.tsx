import Image from "next/image";

type ItemType = {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  trading_status: string;
  condition: string;
  image: string;
  created_at: string;
  updated_at: string;
};
type Props = {
    item: ItemType
}
export function AuctionCard({item}:Props) {
    return (
        <article className="group text-center overflow-hidden transition cursor-pointer mt-3">
            <div className="relative w-full h-40 bg-gray-100 overflow-hidden rounded">

                <div className="absolute top-2 right-2 z-10 bg-black/50 text-white text-sm font-semibold px-2 py-1 rounded-sm">
                    ¥{item.price}
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