import flowbite from "flowbite-react/tailwind";
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      boxShadow: {
        small: "0 4px 4px rgba(0, 0, 0, 0.06)",
      },
      colors: {
        grey: "#E4E4E4",
        green: "#0BB489",
        "dark-grey": "#5A5A5A",
        "dark-blue": "#050B20",
        "dark-green": "#328965",
        "light-green": "#58E1A5",
        ...colors,
      },
    },
  },
  plugins: [flowbite.plugin()],
};
