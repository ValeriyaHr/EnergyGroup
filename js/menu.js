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

//------------ jQuery Accordion Menu
$(function () {
    var $overlay = $("#menuOverlay");
    var $nav = $overlay.find(".menuOverlay__nav");

    // Accordion toggle handler
    $nav.on("click", ".menuItem--toggle", function (e) {
        e.preventDefault();

        var $btn = $(this);
        var $submenu = $("#" + $btn.attr("data-target"));
        var isOpen = $btn.attr("aria-expanded") === "true";

        // Close all other submenus
        $nav.find(".menuItem--toggle").not($btn).each(function () {
            var $other = $(this);
            var $otherSub = $("#" + $other.attr("data-target"));
            $other.attr("aria-expanded", "false").removeClass("is-open");
            $otherSub.stop(true, true).slideUp(180).attr("aria-hidden", "true");
        });

        // Toggle current submenu
        if (isOpen) {
            $btn.attr("aria-expanded", "false").removeClass("is-open");
            $submenu.stop(true, true).slideUp(180).attr("aria-hidden", "true");
        } else {
            $btn.attr("aria-expanded", "true").addClass("is-open");
            $submenu.stop(true, true).slideDown(180).attr("aria-hidden", "false");
        }
    });

    // Close all submenus when menu overlay closes
    $overlay.on("click", ".menuOverlay__close", function () {
        $nav.find(".menuItem--toggle").attr("aria-expanded", "false").removeClass("is-open");
        $nav.find(".menuSub").stop(true, true).slideUp(180).attr("aria-hidden", "true");
    });

    // Wheel scroll support for menu navigation
    $nav.on("wheel", function (e) {
        var $element = $(this);
        var scrollTop = $element.scrollTop();
        var scrollHeight = $element.prop("scrollHeight");
        var clientHeight = $element.prop("clientHeight");

        var isAtTop = scrollTop === 0;
        var isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        // If at top and scrolling up, or at bottom and scrolling down - allow page scroll
        if ((isAtTop && e.originalEvent.deltaY < 0) || (isAtBottom && e.originalEvent.deltaY > 0)) {
            return;
        }

        // Otherwise prevent default and let the menu scroll
        e.preventDefault();
        $element.scrollTop(scrollTop + e.originalEvent.deltaY);
    });
});