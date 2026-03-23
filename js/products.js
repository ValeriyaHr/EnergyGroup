import "./jquery-global.js";

const $ = window.jQuery;

// Mobile panel - переключение режимов отображения продукции
(function ($) {
    if (!$) return;
    $(function () {
        function isMobileView() {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        let $panel = $('.mobile_panel');
        let $grid = $('#productsGrid');
        let $buttons = $panel.find('.mobile_panel__btn');


        if (!$panel.length || !$grid.length) return;

        function switchMobileCardImages(viewMode) {
            if (!isMobileView()) return;

            $grid.find('.productCard__imgWrap').each(function () {
                let $wrap = $(this);
                let $source = $wrap.find('source').first();
                let $img   = $wrap.find('img').first();

                if (!$source.length || !$img.length) return;

                // Зберігаємо оригінальний mob-src один раз
                if (!$source.attr('data-mob-src')) {
                    $source.attr('data-mob-src', $source.attr('srcset') || '');
                }

                let mobSrc  = $source.attr('data-mob-src') || '';
                // Для режиму 2-в-ряд використовуємо єдиний формат файлів: product-XX-mob2.jpg
                let mob2Src = $source.attr('data-mob2-src') || '';
                if (!mob2Src) {
                    let productNumMatch = mobSrc.match(/(product-\d+)-mob\.(png|jpe?g|webp)$/i);
                    if (productNumMatch) {
                        mob2Src = mobSrc.replace(productNumMatch[0], productNumMatch[1] + '-mob2.jpg');
                    } else {
                        mob2Src = mobSrc.replace(/-mob\.(png|jpe?g|webp)$/i, '-mob2.$1');
                        if (mob2Src === mobSrc && /-mob\./i.test(mobSrc)) {
                            mob2Src = mobSrc.replace(/-mob\./i, '-mob2.');
                        }
                    }
                }

                let finalSrc = (viewMode === 'double') ? (mob2Src || mobSrc) : mobSrc;

                $source.attr('srcset', finalSrc);
                $img.attr('src', finalSrc);
            });
        }

        // Обработчик клика на кнопки панели
        $buttons.on('click', function (e) {
            e.preventDefault();

            let $btn = $(this);
            let viewMode = $btn.data('view');

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
            let savedMode = localStorage.getItem('productsViewMode');
            if (savedMode) {
                let $savedBtn = $buttons.filter('[data-view="' + savedMode + '"]');
                if ($savedBtn.length) {
                    $savedBtn.click();
                }
            } else {
                switchMobileCardImages('single');
            }
        } catch (e) {
            switchMobileCardImages('single');
        }

        $(window).on('load resize', function () {

            let mode = $grid.hasClass('view-double') ? 'double' : 'single';
            switchMobileCardImages(mode);

        });
        $('.mobile_panel__btn').click();
    });
})($);

//--------- Открытие и подгрузка детального просмотра продуктов
if ($) $(function () {
    const $wrap = $("#productDetails");
    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

    let lastUrl = null;
    let isLoaded = false;
    let isOpen = false;
    let wheelArmed = true; // щоб не спрацьовувало 20 разів

    // Для доступу до деталей продуктів напряму по ссылке: читаем product из URL,
    // синхронизируем адрес при открытии/закрытии и можем сразу загрузить нужный partial.

    function getProductIdFromLocation() {
        const params = new URLSearchParams(window.location.search);
        const queryProduct = params.get("product");

        if (queryProduct && /^p\d{2}$/i.test(queryProduct)) {
            return queryProduct.toLowerCase();
        }

        const hashMatch = window.location.hash.match(/p\d{2}/i);
        return hashMatch ? hashMatch[0].toLowerCase() : null;
    }

    function setProductLocation(productId) {
        if (!window.history || !window.history.replaceState) return;

        const url = new URL(window.location.href);

        if (productId) {
            url.searchParams.set("product", productId);
            url.hash = productId;
        } else {
            url.searchParams.delete("product");
            url.hash = "";
        }

        window.history.replaceState({}, "", url.toString());
    }





    function openDetails() {
        if (!isLoaded) return;

        $wrap.addClass("is-ready");
        // даємо браузеру вставити DOM, тоді додаємо клас для анімації
        requestAnimationFrame(() => {
            $wrap.addClass("is-open");
            isOpen = true;
            window.dispatchEvent(new CustomEvent('peg:product-details-open'));

            if (!isMobileViewport()) {
                $("html, body").stop().animate({
                    scrollTop: $wrap.offset().top - 60
                }, 350);
            }
        });
    }

    function closeDetails() {
        $wrap.removeClass("is-open");
        isOpen = false;
        setProductLocation(null);
        window.dispatchEvent(new CustomEvent('peg:product-details-close'));

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
            window.dispatchEvent(new CustomEvent('peg:product-details-ready'));
            openDetails();
        });
    }

    function openProductById(productId) {
        if (!productId || !/^p\d{2}$/i.test(String(productId))) return;
        const normalizedProductId = String(productId).toLowerCase();
        const url = `./product-details/${normalizedProductId}.html`;

        setProductLocation(normalizedProductId);
        loadProduct(url);
        wheelArmed = true;
    }

    window.PEGProducts = window.PEGProducts || {};
    window.PEGProducts.openProductById = openProductById;
    window.PEGProducts.closeProductDetails = closeDetails;

    $(document).on("click", ".productDetails__back", function (e) {
        e.preventDefault();
        closeDetails();
    });

    $(document).on("click", ".js-open-product", function (e) {
        e.preventDefault();
        const productId = $(this).data("product"); // p01
        openProductById(productId);
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

    const initialProductId = getProductIdFromLocation();
    if (initialProductId) {
        loadProduct(`./product-details/${initialProductId}.html`);
    }
});


//---------------------------------- Hero preview products

if ($) $(function () {
        let $previewSection = $('.previewProduct');
        let $img = $('#previewProductImage');
        let $title = $('#previewProductTitle');
        let $desc = $('#previewProductDesc');
        let $btnDetails = $('#btnShowDetails');
        let $calculatorBtn = $('#calculator_btn');
        let $grid = $('#productsGrid');

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

        let autoplayInterval = null;
        let currentIndex = 0;
        let $cards = $grid.find('.productCard');

        let heroTypes = [
            'previewProduct--cabinet',
            'previewProduct--module',
            'previewProduct--tall',
            'previewProduct--wide'
        ];

        // fallback, якщо десь у картці ще немає data-type
        let productTypes = {
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

            let productId = $card.data('details');
            let productType = getProductType($card, productId);

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
                $img.attr('src', src + '?' + Date.now());

                if (title) $title.text(title);
                if (desc) $desc.text(desc);

                setPreviewState(productId, productType);

                $img.css('opacity', 1);
                $title.css('opacity', 1);
                $desc.css('opacity', 1);
            }, 90);
        }

        function getProductIdFromLocationForPreview() {
            const params = new URLSearchParams(window.location.search);
            const queryProduct = params.get('product');
            if (queryProduct && /^p\d{2}$/i.test(queryProduct)) {
                return queryProduct.toLowerCase();
            }

            const hashMatch = window.location.hash.match(/p\d{2}/i);
            return hashMatch ? hashMatch[0].toLowerCase() : null;
        }

        function syncPreviewFromProductId(productId) {
            if (!productId) return false;

            let $card = $cards.filter(function () {
                return String($(this).data('details') || '').toLowerCase() === productId.toLowerCase();
            }).first();

            if (!$card.length) return false;

            let cardData = readCardData($card);
            if (!cardData) return false;

            setPreview(
                cardData.previewSrc,
                cardData.title,
                cardData.text,
                cardData.productId,
                cardData.productType
            );

            currentIndex = $cards.index($card);
            return true;
        }

        function showCard(index) {
            if (index >= $cards.length) index = 0;
            if (index < 0) index = $cards.length - 1;

            let $card = $cards.eq(index);
            let cardData = readCardData($card);

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
            let $card = $(e.target).closest('.productCard');
            if (!$card.length) return;

            let cardData = readCardData($card);
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

            let $card = $(this).closest('.productCard');
            if (!$card.length) return;

            let cardData = readCardData($card);
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

        // стартовий стан: якщо товар передано в URL, синхронізуємо hero з ним
        const initialProductId = getProductIdFromLocationForPreview();
        if (!syncPreviewFromProductId(initialProductId)) {
            setPreviewState('p01', 'cabinet');
            toggleCalculator('p01');
        }
        // startAutoplay();
    });

// 352, 391 startAutoplay(); - розкоментувати і почне мінятись сам

