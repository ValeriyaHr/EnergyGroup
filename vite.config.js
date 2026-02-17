import { defineConfig } from 'vite'
import { viteStaticCopy } from "vite-plugin-static-copy";

import handlebars from 'vite-plugin-handlebars'
import path from 'path'

export default defineConfig({
    base: '/EnergyGroup/',
    appType: "mpa",
    build: {
        minify: false,      // отключить минификацию
        sourcemap: true,    // удобно дебажить
        rollupOptions: {
            input: {
                main: "index.html",
                engineering: "engineering.html",
                products: "products.html",
                library: "library.html",
                404: "404.html",
                docs: "docs.html",
                p01: "product-details/p01.html",
                p02: "product-details/p02.html",
                p03: "product-details/p03.html",
                p04: "product-details/p04.html",
                p05: "product-details/p05.html",
                p06: "product-details/p06.html",
                p07: "product-details/p07.html",
                p08: "product-details/p08.html",
                p09: "product-details/p09.html",
                p10: "product-details/p10.html",
                p11: "product-details/p11.html",
                p12: "product-details/p12.html",
                p13: "product-details/p13.html",
                jquery: "js/jquery/jquery-3.7.1.min.js",
                calc: "js/calc.js",
                mainJs: "js/main.js",
                menu: "js/menu.js",
                parnerSlider: "js/parner_slider.js",
                productsJs: "js/products.js",
            },
        }},
    plugins: [
        handlebars({
            partialDirectory: path.resolve(__dirname, 'components'),
        }),
        viteStaticCopy({
            targets: [
                {
                    // лучше относительный путь!
                    src: "js/**/*",
                    dest: "js"
                },
                {
                    src: "img/**/*",   // ← добавили копирование картинок
                    dest: "img"
                }
            ]
        })
    ],
})
