import { defineConfig } from 'vite'
import { viteStaticCopy } from "vite-plugin-static-copy";

import handlebars from 'vite-plugin-handlebars'
import path from 'path'

const productCodes = Array.from({ length: 13 }, (_, i) => `p${String(i + 1).padStart(2, '0')}`);

const uaProductInputs = Object.fromEntries(
    productCodes.map((code) => [code, `product-details/${code}.html`])
);

const enProductInputs = Object.fromEntries(
    productCodes.map((code) => [`en-${code}`, `en/product-details/${code}.html`])
);

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
                ...uaProductInputs,
                enMain: "en/index.html",
                enEngineering: "en/engineering.html",
                enProducts: "en/products.html",
                enLibrary: "en/library.html",
                en404: "en/404.html",
                enDocs: "en/docs.html",
                ...enProductInputs,
                jquery: "js/jquery/jquery-3.7.1.min.js",
                calc: "js/calc.js",
                mainJs: "js/main.js",
                menu: "js/menu.js",
                parnerSlider: "js/parner_slider.js",
                productsJs: "js/products.js",
            },
        }},
    plugins: [
        {
            name: 'rewrite-en-relative-paths',
            apply: 'build',
            enforce: 'pre',
            transformIndexHtml(html, ctx) {
                const pagePath = ctx?.path ?? '';
                if (!pagePath.startsWith('/en/')) return html;

                return html
                    .replace(/(\b(?:src|href|srcset|data-preview)=["'])\.\/(js|css|img)\//gi, '$1../$2/')
                    .replace(/(\b(?:src|href|srcset|data-preview)=["'])img\//gi, '$1../img/');
            },
        },
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
                    src: "js/**/*",
                    dest: "en/js"
                },
                {
                    src: "css/**/*",   // ← добавили копирование CSS
                    dest: "css"
                },
                {
                    src: "css/**/*",
                    dest: "en/css"
                },
                {
                    src: "img/**/*",   // ← добавили копирование картинок
                    dest: "img"
                },
                {
                    src: "img/**/*",
                    dest: "en/img"
                },
                {
                    src: "fonts/**/*",
                    dest: "fonts"
                },
                {
                    src: "fonts/**/*",
                    dest: "en/fonts"
                }
            ]
        })
    ],
})
