import { nextApi } from '@/lib/fetch';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { Item } from '@/types/item';
import { formatNumber } from '@/utils/format-number';


export default function ProductDetailPage() {
    const router = useRouter()
    const [activeIndex, setActiveIndex] = useState(0)
    const swiperRef = useRef<SwiperType|null>(null)
    const { id } = router.query
    const [item,setItem] = useState<Item|null>(null)
    const [isLoaded,setIsLoaded] = useState(false)

    useEffect(() => {
        if (!id) return;
        
        const getItem = async() => {
            try {
                type ResType = {data:Item}
                const res:ResType = await nextApi(`/items/${id}`, {method:"GET"})
                console.log(res.data);
                
                setItem(res.data);
            }   
            catch (e){
                if (e instanceof Error){
                    const errorMessage= JSON.parse(e.message)
                    console.log(errorMessage);
                }
                else {
                    alert("ERR_CODE_500")
                }
            }
        }

        getItem()
    }, [id])

    useEffect(() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, []);


    
    return (
        <div className="bg-white min-h-screen pb-32">
            <div className="p-5 space-y-6">
                <div className="grid grid-cols-7 gap-6 md:grid-cols-1">
                    
                    <div className="col-span-4">
                                    
                        <div className="aspect-square bg-gray-100 w-full flex items-center justify-center text-gray-300 relative">
                            {/* スケルトン */}
                            {!item ? (
                                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                                    <span className="text-gray-400">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <Swiper
                                        className={isLoaded ? "opacity-100" : "opacity-0"}
                                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                        spaceBetween={0}
                                        slidesPerView={1}
                                        pagination={{ clickable: true }}
                                        onInit={()=>setIsLoaded(true)}
                                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                                    >
                                        {item?.images.map((url) => (
                                            <SwiperSlide key={url}>
                                                <img
                                                    src={url}
                                                    className="w-full object-cover"
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    <div className="absolute inset-y-0 left-2 flex items-center z-10">
                                        <button
                                            onClick={() => swiperRef.current?.slidePrev()}
                                            className="hover:bg-blue-500/60 bg-black/40 text-white p-1 py-1.5 rounded-full pr-3.5 text-md"
                                        >
                                            《
                                        </button>
                                    </div>
                                    <div className="absolute inset-y-0 right-2 flex items-center z-10">
                                        <button
                                            onClick={() => swiperRef.current?.slideNext()}
                                            className="hover:bg-blue-500/60 bg-black/40 text-white p-1 py-1.5 rounded-full pl-3.5 text-md"
                                        >
                                            》
                                        </button>
                                    </div>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {item?.images.map((_, i) => (
                                            <span
                                            key={i}
                                            className={`
                                                h-1.5 w-1.5 rounded-full transition-all
                                                ${i === activeIndex
                                                ? "bg-blue-400 scale-125"
                                                : "bg-blue-400/40"}
                                            `}
                                            />
                                        ))}
                                    </div>
                                </>
                        )}
                        </div>
                        
                    </div>

                    <div className="col-span-3 justify-center -mr-4">
                        <h1 className="text-xl font-bold text-gray-800">{item?.title}</h1>
                        <div className="flex items-center justify-between">
                            <p className="text-3xl font-bold text-gray-900">
                                ${item ? formatNumber(item?.price) : 0} <span className="text-sm font-normal text-gray-400">送料込み</span>
                            </p>
                            <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                <Heart size={18} className="text-pink-500" />
                                <span className="text-sm font-bold">24＃＃＃</span>
                            </button>
                        </div>
                        <div className="flex gap-4 p-4 my-4 bg-gray-50 rounded-2xl items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="flex-1 text-sm">
                                <p className="font-bold">出品者名####task</p>
                                <p className="text-gray-500 text-xs">本人確認済み</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>

                        <section className="space-y-3 my-10">
                            <h2 className="font-bold text-gray-800">商品説明</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {item?.description}
                            </p>
                        </section>
                        

                        <div className="mt-4 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3 flex-1">
                            <button className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-full md:rounded-xl active:scale-95 transition shadow-lg">
                                コメント
                            </button>
                            <Link href={`/items/${id}/checkout`} className="flex-[2]">
                                <button className="w-full bg-blue-500 text-white font-bold py-4 rounded-full md:rounded-xl active:scale-95 transition shadow-lg shadow-blue-200">
                                    購入手続き
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronRight({ className, size }: { className?: string; size?: number }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}