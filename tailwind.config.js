/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: { //小さいサイズが後に定義されるように
        // 'md': {'max': '1200px'},   // 767px 以下
        // 'sm': {'max': '700px'},   // 639px 以下

        'xm': {'max': '767px'},  // md以下を簡略名で指定
        'xs': {'max': '639px'},  // sm以下を簡略名で指定
      }
    }
  },
  plugins: [],
}

