/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, /* <-- EL CAMBIO CLAVE ESTÁ AQUÍ */
    autoprefixer: {},
  },
};
export default config;