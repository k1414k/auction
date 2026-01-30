import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // "./pages/**/*.{js,ts,jsx,tsx}",  <-- これを削除または修正
    // "./components/**/*.{js,ts,jsx,tsx}", <-- これも修正
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ src配下の全ファイルを対象にする
  ],
  theme: {
    extend: {
      screens: { //小さいサイズが後に定義されるように !!
        'xl': {'max': '1200px'}, 
        'md': {'max': '900px'},
        'sm': {'max': '650px'},  
        'xs': {'max': '350px'},
      }
    }
  },
  plugins: [],
  // ...
};
export default config;
