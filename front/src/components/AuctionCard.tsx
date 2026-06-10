import { apiAssetUrl } from "@/lib/apiAssetUrl";
import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";
import { Spinner } from "@/components/ui/Spinner";
import Image from "next/image";
import { useState } from "react";

type Props = {
  item: Item;
};

export function AuctionCard({ item }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <article className="group text-center overflow-hidden transition cursor-pointer mt-3">
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded">
        <div className="absolute top-2 right-2 z-10 bg-black/50 text-white text-sm font-semibold px-2 py-1 rounded-sm">
          ¥{formatNumber(item.price)}
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-[1]">
            <Spinner size="sm" />
          </div>
        )}

        <Image
          src={apiAssetUrl(item.image) || ""}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="
            z-0
            object-cover
            p-2
            transition-transform
            duration-300
            scale-110
            group-hover:scale-105
          "
          unoptimized
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      <div className="p-1.5 text-xs">
        <h3 className="text-sm text-slate-800">{item.title}</h3>
      </div>
    </article>
  );
}