(function initPartnersSlider() {
  const root = document.querySelector("[data-partners]");
  if (!root) return;
  const viewport = root.querySelector("[data-partners-viewport]");
  const range = root.querySelector("[data-partners-range]");
  if (!viewport || !range) return;
  const setRangeMax = () => {
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    range.max = String(max);
    range.value = String(Math.round(viewport.scrollLeft));
  };
  range.addEventListener("input", () => {
    viewport.scrollLeft = Number(range.value);
  });
  viewport.addEventListener("scroll", () => {
    range.value = String(Math.round(viewport.scrollLeft));
  }, { passive: true });
  root.addEventListener("wheel", (e) => {
    const canScrollX = viewport.scrollWidth > viewport.clientWidth + 1;
    if (!canScrollX) return;
    const dominantX = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = dominantX ? e.deltaX : e.deltaY;
    e.preventDefault();
    viewport.scrollLeft += delta;
  }, { passive: false });
  setRangeMax();
  window.addEventListener("resize", setRangeMax);
})();
//# sourceMappingURL=parnerSlider-DCXatW8q.js.map
