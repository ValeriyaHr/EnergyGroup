import "./jquery-global.js";

const $ = window.jQuery;

(() => {
    const openBtn = document.querySelector(".header__burger");
    const overlay = document.querySelector("#menuOverlay");
    const closeBtn = document.querySelector(".menuOverlay__close");

    if (!openBtn || !overlay || !closeBtn) return;

    const open = () => {

        // compensation for scrollbar width
        const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
        document.body.style.paddingRight = scrollbarWidth > 0 ? (scrollbarWidth + "px") : "";

        overlay.classList.add("is-open");
        document.body.classList.add("menu-open");
        overlay.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true");
    };

    const close = () => {

        overlay.classList.remove("is-open");
        document.body.classList.remove("menu-open");

        // remove scrollbar compensation
        document.body.style.paddingRight = "";

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

//------------ jQuery Accordion Menu
$(function () {
    let $overlay = $("#menuOverlay");
    let $nav = $overlay.find(".menuOverlay__nav");

    // Accordion toggle handler
    $nav.on("click", ".menuItem--toggle", function (e) {
        e.preventDefault();

        let $btn = $(this);
        let $submenu = $("#" + $btn.attr("data-target"));
        let isOpen = $btn.attr("aria-expanded") === "true";

        // Close all other submenus
        $nav.find(".menuItem--toggle").not($btn).each(function () {
            let $other = $(this);
            let $otherSub = $("#" + $other.attr("data-target"));
            $other.attr("aria-expanded", "false").removeClass("is-open");
            $otherSub.attr("aria-hidden", "true");
        });

        // Toggle current submenu
        if (isOpen) {
            $btn.attr("aria-expanded", "false").removeClass("is-open");
            $submenu.attr("aria-hidden", "true");
        } else {
            $btn.attr("aria-expanded", "true").addClass("is-open");
            $submenu.attr("aria-hidden", "false");
        }
    });

    // Close all submenus when menu overlay closes
    $overlay.on("click", ".menuOverlay__close", function () {
        $nav.find(".menuItem--toggle").attr("aria-expanded", "false").removeClass("is-open");
        $nav.find(".menuSub").attr("aria-hidden", "true");
    });

    // Close overlay on any navigation link click (important for same-page anchors)
    $nav.on("click", "a[href]", function () {
        $("body").removeClass("menu-open").css("paddingRight", "");
        $overlay.removeClass("is-open").attr("aria-hidden", "true");
        $(".header__burger").attr("aria-expanded", "false");
        $nav.find(".menuItem--toggle").attr("aria-expanded", "false").removeClass("is-open");
        $nav.find(".menuSub").attr("aria-hidden", "true");
    });

    // Native scrolling is smoother; keep wheel handler disabled to avoid jank.
});