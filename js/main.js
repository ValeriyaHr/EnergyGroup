// import $ from "jquery";
// window.$ = $;
// window.jQuery = $;

const $ = window.jQuery;


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


// --- arrows as DATA URI (exactly your white-up2.svg & orange-up2.svg) ---
const WHITE_ARROW =
    "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";

const ORANGE_ARROW =
    "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23f80%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";

// ставимо білі стрілки одразу (щоб не було src="")
document.querySelectorAll(".engRow__arrowIcon").forEach((img) => {
    img.src = WHITE_ARROW;
});

// акордеон — клік по всьому блоку
document.addEventListener("click", (e) => {
    const row = e.target.closest(".js-engRow");
    if (!row) return;

    const panel = row.nextElementSibling?.classList.contains("js-engPanel")
        ? row.nextElementSibling
        : null;

    if (!panel) return;

    const icon = row.querySelector(".engRow__arrowIcon");

    const isOpen = row.classList.toggle("is-open");
    row.setAttribute("aria-expanded", String(isOpen));

    if (icon) icon.src = isOpen ? ORANGE_ARROW : WHITE_ARROW;

    const item = row.closest(".engItem");
    if (item) item.classList.toggle("is-open", isOpen);

    panel.hidden = !isOpen;
    panel.classList.toggle("is-open", isOpen);
});


/// ./js/main.js
// Prime Energy Group — main interactions (vanilla JS)

function initWhyUsReveal() {
    const tabs = document.querySelector(".whyus__tabs");
    if (!tabs) return;

    // Якщо вже видно на старті (наприклад, перезавантаження посеред сторінки)
    const inViewportNow = () => {
        const r = tabs.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        return r.top < vh * 0.8 && r.bottom > vh * 0.2;
    };

    if (inViewportNow()) {
        tabs.classList.add("is-inview");
        return;
    }

    const io = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    tabs.classList.add("is-inview");
                    io.disconnect(); // один раз
                    break;
                }
            }
        },
        { threshold: 0.2 }
    );

    io.observe(tabs);
}

function initEngineeringAccordion() {
    const rows = Array.from(document.querySelectorAll(".js-engRow"));
    if (!rows.length) return;

    const closeRow = (row) => {
        const panel = row.parentElement?.querySelector(".js-engPanel");
        const btn = row.querySelector(".js-engArrow");
        const icon = btn?.querySelector("img");

        row.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;

        if (btn && icon) {
            const closed = btn.getAttribute("data-src-closed");
            if (closed) icon.src = closed;
        }
    };

    const openRow = (row) => {
        const panel = row.parentElement?.querySelector(".js-engPanel");
        const btn = row.querySelector(".js-engArrow");
        const icon = btn?.querySelector("img");

        row.setAttribute("aria-expanded", "true");
        if (panel) panel.hidden = false;

        if (btn && icon) {
            const open = btn.getAttribute("data-src-open");
            if (open) icon.src = open;
        }
    };

    rows.forEach((row) => {
        // клік по всьому рядку або по кнопці
        row.addEventListener("click", (e) => {
            const isButton = e.target.closest(".js-engArrow");
            const clickedInsideRow = e.target.closest(".js-engRow");
            if (!isButton && !clickedInsideRow) return;

            const expanded = row.getAttribute("aria-expanded") === "true";

            // якщо треба “тільки один відкритий” — закриваємо інші
            rows.forEach((r) => {
                if (r !== row) closeRow(r);
            });

            if (expanded) closeRow(row);
            else openRow(row);
        });

        // початково — закрито (на випадок якщо HTML десь зламався)
        if (row.getAttribute("aria-expanded") !== "true") closeRow(row);
    });
}

function initSmoothAnchorScroll() {
    // легкий UX: плавно скролимо до якорів
    document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;

        const id = a.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const header = document.querySelector("header");
        const headerH = header ? header.getBoundingClientRect().height : 0;

        const top =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            Math.round(headerH);

        window.scrollTo({ top, behavior: "smooth" });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initWhyUsReveal();
    initEngineeringAccordion();
    initSmoothAnchorScroll();
});