import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Footer } from "@/components/page_components/Footer";
import { Header } from "@/components/page_components/Header";

export default function HomePage() {
  return (
    // <div className="p-6 text-center space-y-6 mx-auto min-h-screen">
    <div>
      <Header />
      {/* // className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" */}
      <main className="max-w-[800px] mx-auto px-4 min-h-[100vh]">
      <section className="rounded-md bg-gradient-to-r from-pink-100 to-rose-300 py-10 my-5 text-center">
        <h1 className="text-4xl font-bold m-4 p-3">
          安く買う、高く売る、共存する
        </h1>
        <p className="text-gray-700 mb-5">
          あなとのオークション
        </p>
        <div className="px-10 mb-8">
          <Input className="text-blue-600" label="探しているモデル名入力" placeholder="iphone, macbook ..." />
        </div>
      </section>
        <Card title={"iphone"} subtitle={"スマホ"}>
          <Button variant="primary" size="lg">
            買う
          </Button>
          <Button variant="danger" size="lg">
            売る
          </Button>
        </Card>
      </main>
      <Footer />
    </div>

  );
}
