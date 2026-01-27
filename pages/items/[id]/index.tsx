import { nextApi } from '@/lib/fetch';
import { Heart, ChevronLeft, Share } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";


export default function ProductDetailPage() {
    const swiperRef = useRef<SwiperType|null>(null)
    const router = useRouter()
    const { id } = router.query
    const [item,setItem] = useState({
        category_id: 0,
        condition: "",
        created_at: "",
        description: "",
        id: 0,
        images: [],
        price: 0,
        title: "",
        trading_status: "",
        updated_at: "",
        user_id: 0
    })

    useEffect(() => {
        if (!id) return;
        
        const getItem = async() => {
            try {
                type ResType = {data:[]}
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

    
    return (
        <div className="bg-white min-h-screen pb-32">
            <div className="w-full flex justify-between p-4"> 
                <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white" onClick={()=>router.push("/search")}><ChevronLeft /></button>
                <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white"><Share size={20} /></button>
            </div>

            <div className="aspect-square bg-gray-100 w-full flex items-center justify-center text-gray-300 relative">
                <Swiper spaceBetween={8} slidesPerView={1} pagination={{ clickable: true }} onSwiper={(swiper)=> swiperRef.current = swiper}>
                    {item.images.map((url) => (
                        <SwiperSlide key={url}>
                            <img
                                src={url}
                                className="w-full aspect-square object-cover"
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
            </div>

            <div className="p-5 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-gray-800">{item.title}</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-gray-900">
                            ${item.price} <span className="text-sm font-normal text-gray-400">送料込み</span>
                        </p>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <Heart size={18} className="text-pink-500" />
                            <span className="text-sm font-bold">24＃＃＃</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 text-sm">
                        <p className="font-bold">出品者名####task</p>
                        <p className="text-gray-500 text-xs">本人確認済み</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                </div>

                <section className="space-y-3">
                    <h2 className="font-bold text-gray-800">商品説明</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                    </p>
                </section>
            </div>

            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
                <button className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-full active:scale-95 transition shadow-lg">
                    コメント ####
                </button>
                <Link href="/items/1/checkout" className="flex-[2]">
                    <button className="w-full bg-blue-500 text-white font-bold py-4 rounded-full active:scale-95 transition shadow-lg shadow-blue-200">
                        購入手続きへ
                    </button>
                </Link>
            </div>
        </div>
    );
}

function ChevronRight({ className, size }: { className?: string; size?: number }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}