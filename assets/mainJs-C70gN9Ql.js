const counterEl = document.querySelector("#counter");
if (counterEl && typeof window.setupCounter === "function") {
  window.setupCounter(counterEl);
}
async function includePart(el) {
  const url = el.getAttribute("data-include");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Include failed: ${url}`);
  el.outerHTML = await res.text();
}
async function includeAll() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all([...nodes].map(includePart));
}
document.addEventListener("DOMContentLoaded", () => {
  includeAll().then(() => {
    initWhyUsUnfold();
    if (typeof initSmoothAnchorScroll === "function") initSmoothAnchorScroll();
  }).catch(console.error);
});
const WHITE_ARROW = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";
const ORANGE_ARROW = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23f80%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";
document.querySelectorAll(".engRow__arrowIcon").forEach((img) => {
  img.src = WHITE_ARROW;
});
document.addEventListener("click", (e) => {
  const row = e.target.closest(".js-engRow");
  if (!row) return;
  const panel = row.nextElementSibling?.classList.contains("js-engPanel") ? row.nextElementSibling : null;
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
function initWhyUsUnfold() {
  const root = document.querySelector("#whyReveal");
  if (!root) return;
  const items = root.querySelectorAll(".whyItem");
  if (!items.length) return;
  root.style.setProperty("--count", String(items.length));
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    root.style.setProperty("--p", "1");
    return;
  }
  let raf = 0;
  let active = false;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const update = () => {
    raf = 0;
    if (!active) return;
    const r = root.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const start = vh * 0.95;
    const end = vh * 0.05;
    const p = clamp01((start - r.top) / (start - end));
    root.style.setProperty("--p", p.toFixed(4));
  };
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(
    (entries) => {
      const isIn = entries.some((e) => e.isIntersecting);
      if (isIn && !active) {
        active = true;
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
      } else if (!isIn && active) {
        active = false;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    },
    { rootMargin: "200px 0px 200px 0px", threshold: 0.01 }
  );
  io.observe(root);
}
//# sourceMappingURL=mainJs-C70gN9Ql.js.map
