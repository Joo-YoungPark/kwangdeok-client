/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",               
    "./src/**/*.{js,ts,jsx,tsx}" 
  ],
  theme: {
    extend: {
      colors:{
        custom_rose : "#ffb7c0",
        custom_purple : "#debbff"
      }


    },
  },
  plugins: [],
};
