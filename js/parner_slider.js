// partners slider (horizontal + wheel + range)
(function initPartnersSlider(){
    const root = document.querySelector('[data-partners]');
    if (!root) return;

    const viewport = root.querySelector('[data-partners-viewport]');
    const range = root.querySelector('[data-partners-range]');
    if (!viewport || !range) return;

    const setRangeMax = () => {
        const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        range.max = String(max);
        range.value = String(Math.round(viewport.scrollLeft));
    };

    // 1) range -> scroll
    range.addEventListener('input', () => {
        viewport.scrollLeft = Number(range.value);
    });

    // 2) scroll -> range
    viewport.addEventListener('scroll', () => {
        range.value = String(Math.round(viewport.scrollLeft));
    }, { passive: true });

    // 3) wheel: vertical wheel => horizontal scroll (when hovering slider)
    root.addEventListener('wheel', (e) => {
        // если есть горизонтальный скролл — перехватываем
        const canScrollX = viewport.scrollWidth > viewport.clientWidth + 1;
        if (!canScrollX) return;

        // если пользователь уже скроллит тачпадом горизонтально — не мешаем
        const dominantX = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const delta = dominantX ? e.deltaX : e.deltaY;

        // не даём странице скроллиться вниз, пока крутим партнёров
        e.preventDefault();
        viewport.scrollLeft += delta;
    }, { passive: false });

    // init
    setRangeMax();
    window.addEventListener('resize', setRangeMax);
})();