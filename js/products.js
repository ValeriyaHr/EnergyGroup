// Mobile panel - переключение режимов отображения продукции
(function ($) {
    $(function () {
        function isMobileView() {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        var $panel = $('.mobile_panel');
        var $grid = $('#productsGrid');
        var $buttons = $panel.find('.mobile_panel__btn');

        if (!$panel.length || !$grid.length) return;

        function switchMobileCardImages(viewMode) {
            if (!isMobileView()) return;

            $grid.find('.productCard__imgWrap').each(function () {
                var $wrap = $(this);
                var $source = $wrap.find('source').first();
                var $img   = $wrap.find('img').first();

                if (!$source.length || !$img.length) return;

                // Зберігаємо оригінальний mob-src один раз
                if (!$source.attr('data-mob-src')) {
                    $source.attr('data-mob-src', $source.attr('srcset') || '');
                }

                var mobSrc  = $source.attr('data-mob-src') || '';
                // mob2 виводиться автоматично заміною суфіксу
                var mob2Src = mobSrc.replace(/-mob\./, '-mob2.');

                var finalSrc = (viewMode === 'double') ? mob2Src : mobSrc;

                $source.attr('srcset', finalSrc);
                $img.attr('src', finalSrc);
            });
        }

        // Обработчик клика на кнопки панели
        $buttons.on('click', function (e) {
            e.preventDefault();

            var $btn = $(this);
            var viewMode = $btn.data('view');

            // Убираем активный класс у всех кнопок
            $buttons.removeClass('active');

            // Добавляем активный класс к текущей кнопке
            $btn.addClass('active');

            // Удаляем все классы режимов
            $grid.removeClass('view-single view-double');

            // Добавляем класс в зависимости от выбранного режима
            if (viewMode === 'single') {
                $grid.addClass('view-single');
            } else if (viewMode === 'double') {
                $grid.addClass('view-double');
            }

            switchMobileCardImages(viewMode);

            // Сохраняем выбор в localStorage
            try {
                localStorage.setItem('productsViewMode', viewMode);
            } catch (e) {
                // Игнорируем ошибки localStorage
            }
        });

        // Восстанавливаем сохраненный режим при загрузке
        try {
            var savedMode = localStorage.getItem('productsViewMode');
            if (savedMode) {
                var $savedBtn = $buttons.filter('[data-view="' + savedMode + '"]');
                if ($savedBtn.length) {
                    $savedBtn.click();
                }
            } else {
                switchMobileCardImages('single');
            }
        } catch (e) {
            // Игнорируем ошибки localStorage
        }

        $(window).on('resize', function () {
            var mode = $grid.hasClass('view-double') ? 'double' : 'single';
            switchMobileCardImages(mode);
        });
    });
})(jQuery);

//--------- Открытие и подгрузка детального просмотра продуктов
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

        // Очищаем содержимое после завершения анимации
        setTimeout(() => {
            $wrap.removeClass("is-ready").empty();
            isLoaded = false;
            //lastUrl = null;
        }, 350);
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

    $(document).on("click", ".productDetails__back", function (e) {
        e.preventDefault();
        closeDetails();
    });
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


//---------------------------------- Hero preview products
(function ($) {
    $(function () {
        var $previewSection = $('.previewProduct');
        var $img = $('#previewProductImage');
        var $title = $('#previewProductTitle');
        var $desc = $('#previewProductDesc');
        var $btnDetails = $('#btnShowDetails');
        var $calculatorBtn = $('#calculator_btn');
        var $grid = $('#productsGrid');

        if (
            !$previewSection.length ||
            !$img.length ||
            !$title.length ||
            !$desc.length ||
            !$btnDetails.length ||
            !$grid.length
        ) {
            return;
        }

        var autoplayInterval = null;
        var currentIndex = 0;
        var $cards = $grid.find('.productCard');

        var heroTypes = [
            'previewProduct--cabinet',
            'previewProduct--module',
            'previewProduct--tall',
            'previewProduct--wide'
        ];

        // fallback, якщо десь у картці ще немає data-type
        var productTypes = {
            p01: 'cabinet',
            p02: 'module',
            p03: 'tall',
            p04: 'tall',
            p05: 'module',
            p06: 'cabinet',
            p07: 'wide',
            p08: 'module',
            p09: 'cabinet',
            p10: 'cabinet',
            p11: 'wide',
            p12: 'module',
            p13: 'tall'
        };

        function getProductType($card, productId) {
            return $card.data('type') || productTypes[productId] || 'cabinet';
        }

        function setPreviewType(type) {
            $previewSection.removeClass(heroTypes.join(' '));

            if (type) {
                $previewSection.addClass('previewProduct--' + type);
            }
        }

        function setPreviewState(productId, productType) {
            setPreviewType(productType);

            $previewSection.attr('data-product-id', productId || '');

            $btnDetails
                .attr('data-product', productId || '')
                .attr('data-type', productType || '')
                .data('product', productId || '');
        }

        function toggleCalculator(productId) {
            if (!$calculatorBtn.length) return;

            if (productId === 'p03') {
                $calculatorBtn.removeClass('hide');
            } else {
                $calculatorBtn.addClass('hide');
            }
        }

        function readCardData($card) {
            if (!$card.length) return null;

            var productId = $card.data('details');
            var productType = getProductType($card, productId);

            return {
                previewSrc: $card.data('preview'),
                title: $card.find('.productCard__title').text().trim(),
                text: $card.find('.productCard__text').text().trim(),
                productId: productId,
                productType: productType
            };
        }

        function setPreview(src, title, desc, productId, productType) {
            if (!src) return;

            $img.css('opacity', 0);
            $title.css('opacity', 0);
            $desc.css('opacity', 0);

            toggleCalculator(productId);

            window.setTimeout(function () {
                $img.attr('src', src);

                if (title) $title.text(title);
                if (desc) $desc.text(desc);

                setPreviewState(productId, productType);

                $img.css('opacity', 1);
                $title.css('opacity', 1);
                $desc.css('opacity', 1);
            }, 90);
        }

        function showCard(index) {
            if (index >= $cards.length) index = 0;
            if (index < 0) index = $cards.length - 1;

            var $card = $cards.eq(index);
            var cardData = readCardData($card);

            if (!cardData) return;

            setPreview(
                cardData.previewSrc,
                cardData.title,
                cardData.text,
                cardData.productId,
                cardData.productType
            );

            currentIndex = index;
        }

        function startAutoplay() {
            stopAutoplay();

            autoplayInterval = window.setInterval(function () {
                currentIndex++;
                if (currentIndex >= $cards.length) currentIndex = 0;
                showCard(currentIndex);
            }, 5000);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                window.clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        $grid.on('mouseover focusin click', function (e) {
            var $card = $(e.target).closest('.productCard');
            if (!$card.length) return;

            var cardData = readCardData($card);
            if (!cardData) return;

            stopAutoplay();

            setPreview(
                cardData.previewSrc,
                cardData.title,
                cardData.text,
                cardData.productId,
                cardData.productType
            );

            currentIndex = $cards.index($card);
        });

        $grid.on('mouseleave', function () {
            // startAutoplay();
        });

        $grid.on('click', '.productCard__link', function (e) {
            e.preventDefault();
            return false;
        });

        $grid.on('click', '.productCard__bottom', function (e) {
            e.preventDefault();

            var $card = $(this).closest('.productCard');
            if (!$card.length) return;

            var cardData = readCardData($card);
            if (!cardData) return;

            stopAutoplay();

            setPreview(
                cardData.previewSrc,
                cardData.title,
                cardData.text,
                cardData.productId,
                cardData.productType
            );

            currentIndex = $cards.index($card);

            $('.productDetails__back').click();

            window.setTimeout(function () {
                $('#btnShowDetails').click();
            }, 150);
        });

        // стартовий стан
        setPreviewState('p01', 'cabinet');
        toggleCalculator('p01');
        // startAutoplay();
    });
})(jQuery);

// 352, 391 startAutoplay(); - розкоментувати і почне мінятись сам

