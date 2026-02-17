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

//------------
$(function () {
    var $overlay = $("#menuOverlay");
    var $nav = $overlay.find(".menuOverlay__nav");

    function closeGroup($btn) {
        var $group = $btn.closest(".menuGroup");
        var $sub = $group.find(".menuSub");

        $btn.removeClass("is-open").attr("aria-expanded", "false");
        $sub.stop(true, true).slideUp(180).attr("aria-hidden", "true");
    }

    function openGroup($btn) {
        var $group = $btn.closest(".menuGroup");
        var $sub = $group.find(".menuSub");

        $btn.addClass("is-open").attr("aria-expanded", "true");
        $sub.stop(true, true).slideDown(180).attr("aria-hidden", "false");
    }

    $nav.on("click", ".menuItem--toggle", function (e) {
        e.preventDefault();

        var $btn = $(this);
        var isOpen = $btn.hasClass("is-open");

        // закриваємо всі інші
        $nav.find(".menuItem--toggle.is-open").not($btn).each(function () {
            closeGroup($(this));
        });

        // перемикаємо поточний
        if (isOpen) closeGroup($btn);
        else openGroup($btn);
    });

    // опціонально: при закритті оверлею — закрити всі підменю
    $overlay.on("closeMenuOverlay", function () {
        $nav.find(".menuItem--toggle.is-open").each(function () {
            closeGroup($(this));
        });
    });
});