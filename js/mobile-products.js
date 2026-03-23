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

        let dragContext = null;
        let lastTranslate = 0;

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

        function setSheetOpenState(isOpen) {
            if (!isMobileViewport()) return;

            $sheet.toggleClass('is-open', isOpen);
            $sheet.attr('aria-hidden', isOpen ? 'false' : 'true');
            $('body').toggleClass('is-product-sheet-open', isOpen);

            if (!isOpen) {
                clearDragTransform();
            }
        }

        function beginDrag(mode, startY) {
            dragContext = {
                mode: mode,
                startY: startY,
                productId: null,
                hasMoved: false
            };

            $sheet.addClass('is-dragging is-open');
            $panel.addClass('is-dragging');

            if (mode === 'opening') {
                setTranslate(getPanelHeight());
            } else {
                setTranslate(0);
            }
        }

        function finishDrag(shouldOpen) {
            $sheet.removeClass('is-dragging');
            $panel.removeClass('is-dragging');

            if (shouldOpen) {
                setSheetOpenState(true);
            } else {
                setSheetOpenState(false);
                if (window.PEGProducts && typeof window.PEGProducts.closeProductDetails === 'function') {
                    window.PEGProducts.closeProductDetails();
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

        // Swipe-up from product triggers (card CTA or hero button)
        $(document).on('touchstart', '.productCard__bottom, #btnShowDetails', function (event) {
            if (!isMobileViewport()) return;
            if ($sheet.hasClass('is-open')) return;

            const startY = getTouchY(event);
            if (!startY) return;

            beginDrag('opening', startY);
            dragContext.productId = resolveProductId($(this));
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
                setTranslate(getPanelHeight() - dragUp);
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
                    finishDrag(false);
                    return;
                }

                const shouldOpen = lastTranslate <= panelHeight * OPEN_DRAG_RATIO || deltaY < -90;
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

            beginDrag('closing', startY);
        });

        $overlay.on('click', function () {
            if (window.PEGProducts && typeof window.PEGProducts.closeProductDetails === 'function') {
                window.PEGProducts.closeProductDetails();
            } else {
                setSheetOpenState(false);
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
            setSheetOpenState(true);
        });

        window.addEventListener('peg:product-details-close', function () {
            setSheetOpenState(false);
        });

        window.addEventListener('resize', function () {
            if (!isMobileViewport()) {
                $sheet.removeClass('is-open is-dragging');
                $panel.removeClass('is-dragging');
                clearDragTransform();
                $('body').removeClass('is-product-sheet-open');
            }
        });
    });
})($);

