import $ from "jquery";
window.$ = $;
window.jQuery = $;


//import "./menu.js";



// Вызов setupCounter — только если функция определена (защита от Vite шаблонных артефактов)
const counterEl = document.querySelector('#counter');
if (counterEl && typeof window.setupCounter === 'function') {
    window.setupCounter(counterEl);
}
