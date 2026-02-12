import $ from "jquery";
window.$ = $;
window.jQuery = $;


//import "./menu.js";



// Вызов setupCounter — только если функция определена (защита от Vite шаблонных артефактов)
const counterEl = document.querySelector('#counter');
if (counterEl && typeof window.setupCounter === 'function') {
    window.setupCounter(counterEl);
}

//--- скрипт подключение картинок
async function includePart(el) {
    const url = el.getAttribute('data-include');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Include failed: ${url}`);
    el.outerHTML = await res.text();
}

async function includeAll() {
    const nodes = document.querySelectorAll('[data-include]');
    await Promise.all([...nodes].map(includePart));
}

includeAll().catch(console.error);