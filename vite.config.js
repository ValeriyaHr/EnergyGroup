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
        assetsInlineLimit: 0, // не инлайнить ничего
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
        {
            name: 'reorder-mobile-css-links',
            apply: 'build',
            enforce: 'post',
            generateBundle(_, bundle) {
                for (const chunk of Object.values(bundle)) {
                    if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.html')) continue;
                    if (typeof chunk.source !== 'string') continue;

                    const html = chunk.source;
                    const linkRe = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;
                    const links = html.match(linkRe);
                    if (!links || links.length < 2) continue;

                    const mobileLinks = links.filter(
                        (tag) => /mobile-[^"']+\.css/i.test(tag) || /mobile\.css/i.test(tag)
                    );
                    if (!mobileLinks.length) continue;

                    const nonMobileLinks = links.filter((tag) => !mobileLinks.includes(tag));
                    const orderedLinks = [...nonMobileLinks, ...mobileLinks];

                    // Меняем только порядок stylesheet-ссылок, остальное в head не трогаем.
                    let i = 0;
                    chunk.source = html.replace(linkRe, () => orderedLinks[i++]);
                }
            },
        },
        viteStaticCopy({
            targets: [
                {
                    // лучше относительный путь!
                    src: "js/**/*",
                    dest: "js"
                },
                {
                    src: "css/**/*",   // ← добавили копирование CSS
                    dest: "css"
                },
                {
                    src: "img/**/*",   // ← добавили копирование картинок
                    dest: "img"
                }
            ]
        })
    ],
})
