/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
     container: {
    center: true,
    padding: '1rem',
    screens: {
      '2xl': '1536px',
    },
  },
    extend: {
    keyframes: {
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
    animation: {
      'fade-in': 'fade-in 1s ease-in-out',
       fadeIn: "fadeIn 0.3s ease-out",
  
    },
    fontFamily: {
    caveat: ['"Caveat"', 'cursive'],
    dancing: ['"Dancing Script"', 'cursive'],
   },

    keyframes: {
      fadeIn: {
        from: { opacity: 0, transform: "scale(0.95)" },
        to: { opacity: 1, transform: "scale(1)" },
        "0%": { opacity: 0 },
        "100%": { opacity: 1 },
      },
  },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
}
