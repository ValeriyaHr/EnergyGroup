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

        function setSheetState(mode) {
            if (!isMobileViewport()) return;

            const isOpen = mode === 'open';

            $sheet.toggleClass('is-open', isOpen);
            $sheet.attr('aria-hidden', isOpen ? 'false' : 'true');

            if (!isOpen) {
                clearDragTransform();
                return;
            }

            clearDragTransform();
        }

        function beginDrag(startY) {
            dragContext = {
                startY: startY,
                hasMoved: false
            };

            $sheet.addClass('is-dragging is-open');
            $panel.addClass('is-dragging');
            setTranslate(0);
        }

        function finishDrag(shouldClose) {
            $sheet.removeClass('is-dragging');
            $panel.removeClass('is-dragging');

            if (shouldClose) {
                setSheetState('closed');
                if (window.PEGProducts && typeof window.PEGProducts.closeProductDetails === 'function') {
                    window.PEGProducts.closeProductDetails();
                }
            } else {
                setSheetState('open');
            }

            dragContext = null;
        }

        $(document).on('touchmove', function (event) {
            if (!dragContext || !isMobileViewport()) return;

            const currentY = getTouchY(event);
            if (!currentY) return;

            const deltaY = currentY - dragContext.startY;

            if (!dragContext.hasMoved && Math.abs(deltaY) < 4) {
                return;
            }

            dragContext.hasMoved = true;

            const dragDown = Math.max(0, deltaY);
            setTranslate(dragDown);
            event.preventDefault();
        });

        $(document).on('touchend touchcancel', function (event) {
            if (!dragContext || !isMobileViewport()) return;

            const releaseY = getReleaseTouchY(event);
            const deltaY = releaseY - dragContext.startY;
            const panelHeight = getPanelHeight();
            const shouldClose = lastTranslate >= panelHeight * CLOSE_DRAG_RATIO || deltaY > 70;

            finishDrag(shouldClose);
        });

        // Swipe-close only from handle to avoid breaking native inner scroll.
        $handle.on('touchstart', function (event) {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-open')) return;

            const startY = getTouchY(event);
            if (!startY) return;

            beginDrag(startY);
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

        window.addEventListener('peg:product-details-open', function () {
            if (!isMobileViewport()) return;
            setSheetState('open');
        });

        window.addEventListener('peg:product-details-close', function () {
            setSheetState('closed');
        });

        window.addEventListener('resize', function () {
            if (!isMobileViewport()) {
                $sheet.removeClass('is-open is-dragging');
                $panel.removeClass('is-dragging');
                clearDragTransform();
            }
        });

        // Safe initial state.
        $sheet.removeClass('is-open is-dragging');
        $panel.removeClass('is-dragging');
        clearDragTransform();
        $sheet.attr('aria-hidden', 'true');
    });
})($);

