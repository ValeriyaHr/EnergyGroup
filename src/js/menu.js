(() => {
    const openBtn = document.querySelector(".header__burger");
    const overlay = document.querySelector("#menuOverlay");
    const closeBtn = document.querySelector(".menuOverlay__close");

    if (!openBtn || !overlay || !closeBtn) return;

    const open = () => {
        overlay.classList.add("is-open");
        document.body.classList.add("menu-open");
        overlay.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true");
    };

    const close = () => {
        overlay.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        overlay.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false");
    };

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
})();