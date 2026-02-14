$(function () {
    const $wrap = $("#productDetails");

    let lastUrl = null;
    let isLoaded = false;
    let isOpen = false;
    let wheelArmed = true; // щоб не спрацьовувало 20 разів

    function openDetails() {
        if (!isLoaded) return;

        $wrap.addClass("is-ready");
        // даємо браузеру вставити DOM, тоді додаємо клас для анімації
        requestAnimationFrame(() => {
            $wrap.addClass("is-open");
            isOpen = true;

            $("html, body").stop().animate({
                scrollTop: $wrap.offset().top - 60
            }, 350);
        });
    }

    function closeDetails() {
        $wrap.removeClass("is-open");
        isOpen = false;
    }

    function loadProduct(url) {
        // якщо вже завантажували той самий — просто відкриваємо
        if (isLoaded && url === lastUrl) {
            openDetails();
            return;
        }

        isLoaded = false;
        isOpen = false;
        lastUrl = url;

        $wrap.removeClass("is-open is-ready").hide().empty();

        $wrap.load(url, function (response, status) {
            if (status === "error") {
                $wrap.show().addClass("is-ready").html("<p>Помилка завантаження</p>");
                return;
            }

            isLoaded = true;
            $wrap.show(); // показуємо контейнер
            openDetails();
        });
    }

    // ✅ КЛІК по кнопці
    $(document).on("click", ".js-open-product", function (e) {
        e.preventDefault();

        const productId = $(this).data("product"); // p01
        const url = `./product-details/${productId}.html`;
        loadProduct(url);

        // після кліку дозволяємо відкриття колесом ще раз
        wheelArmed = true;
    });

    // ✅ ВІДКРИТТЯ колесиком вниз (тільки якщо вже щось підвантажено)
    $(window).on("wheel", function (e) {
        const deltaY = e.originalEvent.deltaY;

        // тільки "вниз"
        if (deltaY <= 0) return;

        // якщо вже відкрито або нічого не завантажено — нічого не робимо
        if (!isLoaded || isOpen) return;

        // антиспам
        if (!wheelArmed) return;
        wheelArmed = false;

        openDetails();

        // через секунду знову можна (на випадок якщо закриєш/перезавантажиш)
        setTimeout(() => (wheelArmed = true), 800);
    });

    // (опціонально) закриття по Esc
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") closeDetails();
    });
});