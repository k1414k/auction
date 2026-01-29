import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // "./pages/**/*.{js,ts,jsx,tsx}",  <-- これを削除または修正
    // "./components/**/*.{js,ts,jsx,tsx}", <-- これも修正
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ src配下の全ファイルを対象にする
  ],
  theme: {
    extend: {
      screens: { //小さいサイズが後に定義されるように
        'md': {'max': '1200px'},   // 767px 以下
        'sm': {'max': '900px'},   // 639px 以下
        'xm': {'max': '767px'},  // md以下を簡略名で指定
        'xs': {'max': '639px'},  // sm以下を簡略名で指定
      }
    }
  },
  plugins: [],
  // ...
};
export default config;
