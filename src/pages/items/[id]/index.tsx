import { nextApi } from '@/lib/fetch';
import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { Item } from '@/types/item';
import { formatNumber } from '@/utils/format-number';
import { apiAssetUrl } from '@/lib/apiAssetUrl';
import { SkeletonDetail } from '@/components/ui/SkeletonDetail';
import { Modal } from '@/components/Modal';
import Image from 'next/image';


export default function ProductDetailPage() {
    const router = useRouter()
    const [activeIndex, setActiveIndex] = useState(0)
    const swiperRef = useRef<SwiperType|null>(null)
    const { id } = router.query
    const [item,setItem] = useState<Item|null>(null)
    const [isLoaded,setIsLoaded] = useState(false)
    const [bidAmount, setBidAmount] = useState("")
    const [offerAmount, setOfferAmount] = useState("")
    const [offerModalOpen, setOfferModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const toggleFavorite = async() => {
        if (!item) return

        try {
            setItem({...item, is_favorited: !item.is_favorited});
            type ResType = {data:{
                favorited: boolean
            }}
            const res:ResType = await nextApi(`/items/${item.id}/favorite`, {
                method: "PUT"
            })
            console.log(res.data);
            setItem({...item, is_favorited: res.data.favorited});//これにより通信失敗がもし起きたら正常の画面が表示される
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

    const minBid = (() => {
      if (!item) return 0
      const inc = item.min_increment ?? 100
      const base = item.current_bid ?? item.start_price ?? item.price
      return base + inc
    })()

    const isAuctionEnded = item?.end_at ? new Date(item.end_at) < new Date() : false

    const handleBid = async () => {
      if (!item || !id || submitting) return
      const amount = parseInt(bidAmount, 10)
      if (isNaN(amount) || amount < minBid) {
        alert(`最低入札額は¥${minBid.toLocaleString()}以上です`)
        return
      }
      setSubmitting(true)
      try {
        await nextApi(`/items/${id}/bids`, { method: "POST", body: { amount } })
        setItem({ ...item, current_bid: amount, bids_count: (item.bids_count ?? 0) + 1 })
        setBidAmount("")
        alert("入札しました")
      } catch (e) {
        if (e instanceof Error) {
          try {
            const parsed = JSON.parse(e.message)
            alert(parsed?.error ?? "入札に失敗しました")
          } catch {
            alert("入札に失敗しました")
          }
        }
      } finally {
        setSubmitting(false)
      }
    }

    const handleOffer = async () => {
      if (!item || !id || submitting) return
      const amount = parseInt(offerAmount, 10)
      if (isNaN(amount) || amount <= 0) {
        alert("オファー額を入力してください")
        return
      }
      setSubmitting(true)
      try {
        await nextApi(`/items/${id}/offers`, { method: "POST", body: { amount } })
        setOfferModalOpen(false)
        setOfferAmount("")
        alert("オファーを送信しました")
      } catch (e) {
        if (e instanceof Error) {
          try {
            const parsed = JSON.parse(e.message)
            alert(parsed?.error ?? "オファーに失敗しました")
          } catch {
            alert("オファーに失敗しました")
          }
        }
      } finally {
        setSubmitting(false)
      }
    }

    useEffect(() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, []);


    
    if (!item) {
        return (
            <div className="bg-white min-h-screen pb-32">
                <SkeletonDetail />
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            <div className="p-5 space-y-6">
                <div className="grid grid-cols-7 gap-6 md:grid-cols-1">
                    
                    <div className="col-span-4">
                                    
                        <div className="aspect-square bg-gray-100 w-full flex items-center justify-center text-gray-300 relative">
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
                                                <Image
                                                    fill
                                                    src={apiAssetUrl(url)}
                                                    alt={item.title}
                                                    className="object-cover"
                                                    unoptimized
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
                        </div>
                        
                    </div>

                    <div className="col-span-3 justify-center -mr-4">
                        <h1 className="text-xl font-bold text-gray-800">{item?.title}</h1>
                        <div className="flex items-center justify-between">
                            <p className="text-3xl font-bold text-gray-900">
                                ¥{formatNumber(item.price)} <span className="text-sm font-normal text-gray-400">送料込み</span>
                            </p>
                            <button 
                                onClick={toggleFavorite}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                <Heart size={18} className={
                                    item?.is_favorited?  
                                    "fill-pink-500 stroke-pink-500": "stroke-pink-500" 
                                    }
                                />
                            </button>
                        </div>
                        <Link href={`/user/${item.user_id}`} className="flex gap-4 p-4 my-4 bg-gray-50 rounded-2xl items-center hover:bg-gray-100 transition">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="flex-1 text-sm">
                                <p className="font-bold">{item.user_nickname}</p>
                                <p className="text-gray-500 text-xs">本人確認済み</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>

                        <section className="space-y-3 my-10">
                            <h2 className="font-bold text-gray-800">商品説明</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {item?.description}
                            </p>
                        </section>
                        
                        {
                            item.created_by_current_user ? (
                            <Link href="/user/items" className="block">
                                <button className="w-full bg-blue-500 text-white font-bold py-4 rounded-full md:rounded-xl active:scale-95 transition shadow-lg shadow-blue-200">
                                    商品管理
                                </button>
                            </Link>
                            ) : item.sale_type === "auction" ? (
                            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md border-t space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-gray-600">
                                        {item.current_bid ? `現在: ¥${formatNumber(item.current_bid)}` : `開始価格: ¥${formatNumber(item.start_price ?? item.price)}`}
                                    </span>
                                    {item.bids_count ? <span className="text-xs text-gray-400">{item.bids_count}件入札</span> : null}
                                </div>
                                {!isAuctionEnded ? (
                                  <>
                                    <p className="text-xs text-gray-500">最低入札額: ¥{formatNumber(minBid)}</p>
                                    <div className="flex gap-2">
                                      <input
                                        type="number"
                                        min={minBid}
                                        placeholder={`¥${minBid.toLocaleString()}`}
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        className="flex-1 p-3 border border-gray-200 rounded-xl text-lg font-bold"
                                      />
                                      <button
                                        onClick={handleBid}
                                        disabled={submitting}
                                        className="px-6 bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition disabled:opacity-50"
                                      >
                                        {submitting ? "送信中..." : "入札する"}
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-500">オークションは終了しました</p>
                                )}
                            </div>
                            ) : item.sale_type === "negotiation" ? (
                            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
                                <button
                                  onClick={() => setOfferModalOpen(true)}
                                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white font-bold py-4 rounded-full active:scale-95 transition"
                                >
                                  <MessageCircle size={20} />
                                  値段交渉
                                </button>
                                <Link href={`/items/${id}/checkout`} className="flex-[2]">
                                    <button className="w-full bg-blue-500 text-white font-bold py-4 rounded-full active:scale-95 transition shadow-lg shadow-blue-200">
                                        即購入 ¥{formatNumber(item.price)}
                                    </button>
                                </Link>
                            </div>
                            ) : (
                            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md border-t">
                                <Link href={`/items/${id}/checkout`} className="block">
                                    <button className="w-full bg-blue-500 text-white font-bold py-4 rounded-full md:rounded-xl active:scale-95 transition shadow-lg shadow-blue-200">
                                        購入手続き
                                    </button>
                                </Link>
                            </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {offerModalOpen && (
              <Modal isOpen={offerModalOpen} onClose={() => setOfferModalOpen(false)} title="値段交渉">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">希望する価格を入力して出品者にオファーを送信します</p>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">オファー金額（円）</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="例: 5000"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOfferModalOpen(false)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleOffer}
                      disabled={submitting}
                      className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50"
                    >
                      {submitting ? "送信中..." : "オファーする"}
                    </button>
                  </div>
                </div>
              </Modal>
            )}
        </div>
    );
}

function ChevronRight({ className, size }: { className?: string; size?: number }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}