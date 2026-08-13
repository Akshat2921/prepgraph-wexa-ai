/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Topographic trail-map palette — topics are peaks, prerequisites
        // are trails, mastered topics are summited. See design notes in README.
        base: "#0F1512",
        panel: "#16201C",
        contour: "#2A3B32",
        parchment: "#EDEAE1",
        muted: "#8B9A90",
        trail: "#E8A33D",
        summit: "#6FA88A",
        rust: "#C1553F",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
