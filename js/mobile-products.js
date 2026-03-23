import "./jquery-global.js";

const $ = window.jQuery;

(function ($) {
    if (!$) return;

    $(function () {
        const $sheet = $('#mobileProductsSheet');
        if (!$sheet.length) return;

        const $panel = $sheet.find('[data-mobile-sheet-panel]');
        const $overlay = $sheet.find('[data-mobile-sheet-overlay]');
        const $handle = $sheet.find('[data-mobile-sheet-handle]');

        const OPEN_DRAG_RATIO = 0.45;
        const CLOSE_DRAG_RATIO = 0.25;
        const PEEK_VISIBLE_HEIGHT = 92;

        let dragContext = null;
        let lastTranslate = 0;
        let pendingPeekOnNextOpen = false;

        function isMobileViewport() {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        function getTouchY(event) {
            const touch = event.originalEvent.touches && event.originalEvent.touches[0];
            return touch ? touch.clientY : 0;
        }

        function getReleaseTouchY(event) {
            const touch = event.originalEvent.changedTouches && event.originalEvent.changedTouches[0];
            return touch ? touch.clientY : 0;
        }

        function getPanelHeight() {
            const panelHeight = $panel.outerHeight() || Math.round(window.innerHeight * 0.85);
            return Math.max(panelHeight, 1);
        }

        function getPeekTranslate() {
            return Math.max(0, getPanelHeight() - PEEK_VISIBLE_HEIGHT);
        }

        function setTranslate(y) {
            const panelHeight = getPanelHeight();
            const clamped = Math.max(0, Math.min(y, panelHeight));
            lastTranslate = clamped;
            $panel.css('transform', `translateY(${clamped}px)`);
        }

        function clearDragTransform() {
            lastTranslate = 0;
            $panel.css('transform', '');
        }

        function setSheetState(mode) {
            if (!isMobileViewport()) return;

            const isOpen = mode === 'open' || mode === 'peek';
            const isPeek = mode === 'peek';

            $sheet.toggleClass('is-open', isOpen);
            $sheet.toggleClass('is-peek', isPeek);
            $sheet.attr('aria-hidden', isOpen ? 'false' : 'true');
            $('body').toggleClass('is-product-sheet-open', mode === 'open');

            if (mode === 'closed') {
                clearDragTransform();
                return;
            }

            if (mode === 'peek') {
                setTranslate(getPeekTranslate());
                return;
            }

            clearDragTransform();
        }

        function beginDrag(mode, startY, origin) {
            dragContext = {
                mode: mode,
                startY: startY,
                productId: null,
                hasMoved: false,
                startTranslate: mode === 'opening' ? lastTranslate : 0,
                origin: origin || 'trigger'
            };

            $sheet.addClass('is-dragging is-open').removeClass('is-peek');
            $panel.addClass('is-dragging');

            if (mode === 'opening') {
                const openingStart = dragContext.startTranslate > 0
                    ? dragContext.startTranslate
                    : getPanelHeight();
                setTranslate(openingStart);
            } else {
                setTranslate(0);
            }
        }

        function finishDrag(shouldOpen) {
            $sheet.removeClass('is-dragging');
            $panel.removeClass('is-dragging');

            if (shouldOpen) {
                setSheetState('open');
            } else {
                if (dragContext && dragContext.mode === 'opening') {
                    setSheetState('peek');
                } else {
                    setSheetState('closed');
                    if (window.PEGProducts && typeof window.PEGProducts.closeProductDetails === 'function') {
                        window.PEGProducts.closeProductDetails();
                    }
                }
            }

            dragContext = null;
        }

        function resolveProductId($trigger) {
            const directProductId = ($trigger.data('product') || '').toString().toLowerCase();
            if (/^p\d{2}$/.test(directProductId)) {
                return directProductId;
            }

            const cardProductId = ($trigger.closest('.productCard').data('details') || '').toString().toLowerCase();
            if (/^p\d{2}$/.test(cardProductId)) {
                return cardProductId;
            }

            const previewProductId = ($('#btnShowDetails').data('product') || '').toString().toLowerCase();
            return /^p\d{2}$/.test(previewProductId) ? previewProductId : null;
        }

        // Tap/click on product -> open details in peek state first.
        $(document).on('click', '.productCard__bottom, #btnShowDetails', function () {
            if (!isMobileViewport()) return;
            if (dragContext) return;
            pendingPeekOnNextOpen = true;
        });

        $(document).on('touchmove', function (event) {
            if (!dragContext || !isMobileViewport()) return;

            const currentY = getTouchY(event);
            if (!currentY) return;

            const deltaY = currentY - dragContext.startY;

            if (dragContext.mode === 'opening') {
                if (deltaY > 0 && !dragContext.hasMoved) {
                    finishDrag(false);
                    return;
                }

                if (!dragContext.hasMoved && Math.abs(deltaY) < 4) {
                    return;
                }

                if (!dragContext.hasMoved && dragContext.productId && window.PEGProducts && typeof window.PEGProducts.openProductById === 'function') {
                    window.PEGProducts.openProductById(dragContext.productId);
                }

                dragContext.hasMoved = true;

                const dragUp = Math.max(0, dragContext.startY - currentY);
                setTranslate(dragContext.startTranslate - dragUp);
                event.preventDefault();
                return;
            }

            if (dragContext.mode === 'closing') {
                const dragDown = Math.max(0, deltaY);
                setTranslate(dragDown);
                event.preventDefault();
            }
        });

        $(document).on('touchend touchcancel', function (event) {
            if (!dragContext || !isMobileViewport()) return;

            const releaseY = getReleaseTouchY(event);
            const deltaY = releaseY - dragContext.startY;
            const panelHeight = getPanelHeight();

            if (dragContext.mode === 'opening') {
                if (!dragContext.hasMoved) {
                    if (dragContext.origin === 'panel') {
                        setSheetState('open');
                    } else if (dragContext.productId && window.PEGProducts && typeof window.PEGProducts.openProductById === 'function') {
                        window.PEGProducts.openProductById(dragContext.productId);
                        setSheetState('peek');
                    } else {
                        finishDrag(false);
                    }
                    dragContext = null;
                    return;
                }

                // Якщо користувач тягнув вверх і відпустив — панель автоматично дорозкривається.
                const shouldOpen = lastTranslate <= panelHeight * OPEN_DRAG_RATIO || deltaY < -90 || dragContext.hasMoved;
                finishDrag(shouldOpen);
                return;
            }

            if (dragContext.mode === 'closing') {
                const shouldClose = lastTranslate >= panelHeight * CLOSE_DRAG_RATIO || deltaY > 70;
                finishDrag(!shouldClose);
            }
        });

        // Swipe-down close only from handle area to avoid breaking inner scroll.
        $handle.on('touchstart', function (event) {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-open')) return;

            const startY = getTouchY(event);
            if (!startY) return;

            if ($sheet.hasClass('is-peek')) {
                beginDrag('opening', startY, 'panel');
                return;
            }

            beginDrag('closing', startY, 'handle');
        });

        // Tap on handle in peek mode -> fully open.
        $handle.on('click', function () {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-peek')) return;
            setSheetState('open');
        });

        // Peek panel: allow dragging/opening from any panel touch area.
        $panel.on('touchstart', function (event) {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-peek')) return;
            if (dragContext) return;

            const startY = getTouchY(event);
            if (!startY) return;

            beginDrag('opening', startY, 'panel');
        });

        $panel.on('click', function (event) {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-peek')) return;
            if (dragContext) return;
            setSheetState('open');
        });

        $overlay.on('click', function () {
            if (window.PEGProducts && typeof window.PEGProducts.closeProductDetails === 'function') {
                window.PEGProducts.closeProductDetails();
            } else {
                setSheetState('closed');
            }
        });

        $(document).on('keydown', function (event) {
            if (event.key !== 'Escape' || !isMobileViewport()) return;
            if (window.PEGProducts && typeof window.PEGProducts.closeProductDetails === 'function') {
                window.PEGProducts.closeProductDetails();
            }
        });

        // Sync bottom-sheet state with existing product details lifecycle.
        window.addEventListener('peg:product-details-open', function () {
            if (!isMobileViewport()) return;
            if (pendingPeekOnNextOpen) {
                setSheetState('peek');
                pendingPeekOnNextOpen = false;
                return;
            }

            setSheetState('open');
        });

        window.addEventListener('peg:product-details-close', function () {
            pendingPeekOnNextOpen = false;
            setSheetState('closed');
        });

        window.addEventListener('resize', function () {
            if (!isMobileViewport()) {
                $sheet.removeClass('is-open is-dragging is-peek');
                $panel.removeClass('is-dragging');
                clearDragTransform();
                $('body').removeClass('is-product-sheet-open');
                pendingPeekOnNextOpen = false;
            }
        });

        // Safe initial state: sheet hidden in background until explicit open.
        $sheet.removeClass('is-open is-dragging is-peek');
        $panel.removeClass('is-dragging');
        clearDragTransform();
        $sheet.attr('aria-hidden', 'true');
    });
})($);

