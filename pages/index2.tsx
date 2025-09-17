import { Header } from "@/components/page_components/Header";

export default function HomePage() {
  return (
    <div>
      <Header />
      <main className="max-w-[800px] mx-auto px-4 min-h-[100vh]">
      {/* <section className="rounded-md bg-gradient-to-r from-pink-100 to-rose-300 py-10 my-5 text-center">
        <h1 className="text-4xl font-bold m-4 p-3">
          安く買う、高く売る、共存する
        </h1>
        <p className="text-gray-700 mb-5">
          あなとのオークション
        </p>
        <div className="px-10 mb-8">
          <Input className="text-blue-600" label="探しているモデル名入力" placeholder="iphone, macbook ..." />
        </div>
      </section> */}
        {/* <Card title={"iphone"} subtitle={"スマホ"}>
          <Button variant="primary" size="lg">
            買う
          </Button>
          <Button variant="danger" size="lg">
            売る
          </Button>
        </Card> */}
      </main>
      {/* <Footer /> */}
    </div>

  );
}
