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
        const PEEK_VISIBLE_HEIGHT = 140;
        const DRAG_START_THRESHOLD = 6;

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
            $panel.css('transform', `translate3d(0, ${clamped}px, 0)`);
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

            if (!isOpen) {
                clearDragTransform();
                return;
            }

            if (isPeek) {
                setTranslate(getPeekTranslate());
                return;
            }

            clearDragTransform();
        }

        function beginDrag(mode, startY) {
            dragContext = {
                mode: mode,
                startY: startY,
                hasMoved: false,
                startTranslate: mode === 'opening' ? getPeekTranslate() : 0
            };

            $sheet.addClass('is-dragging is-open');
            $panel.addClass('is-dragging');
            setTranslate(dragContext.startTranslate);
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

            if (!dragContext.hasMoved && Math.abs(deltaY) < DRAG_START_THRESHOLD) {
                return;
            }

            dragContext.hasMoved = true;

            if (dragContext.mode === 'opening') {
                const dragUp = Math.max(0, dragContext.startY - currentY);
                setTranslate(dragContext.startTranslate - dragUp);
                event.preventDefault();
                return;
            }

            const dragDown = Math.max(0, deltaY);
            setTranslate(dragDown);
            event.preventDefault();
        });

        $(document).on('touchend touchcancel', function (event) {
            if (!dragContext || !isMobileViewport()) return;

            const releaseY = getReleaseTouchY(event);
            const deltaY = releaseY - dragContext.startY;
            const panelHeight = getPanelHeight();

            if (dragContext.mode === 'opening') {
                const shouldOpen = lastTranslate <= panelHeight * OPEN_DRAG_RATIO || deltaY < -70;
                $sheet.removeClass('is-dragging');
                $panel.removeClass('is-dragging');
                setSheetState(shouldOpen ? 'open' : 'peek');
                dragContext = null;
                return;
            }

            const shouldClose = lastTranslate >= panelHeight * CLOSE_DRAG_RATIO || deltaY > 70;
            finishDrag(shouldClose);
        });

        $(document).on('click', '.productCard__bottom, #btnShowDetails', function () {
            if (!isMobileViewport()) return;
            if (dragContext) return;
            pendingPeekOnNextOpen = true;
            setSheetState('peek');
        });

        // Swipe/drag from handle and bottom tail.
        $handle.on('touchstart', function (event) {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-open')) return;

            const startY = getTouchY(event);
            if (!startY) return;

            beginDrag($sheet.hasClass('is-peek') ? 'opening' : 'closing', startY);
        });

        $handle.on('click', function () {
            if (!isMobileViewport()) return;
            if (!$sheet.hasClass('is-peek')) return;
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
                pendingPeekOnNextOpen = false;
            }
        });

        // Safe initial state.
        $sheet.removeClass('is-open is-dragging is-peek');
        $panel.removeClass('is-dragging');
        clearDragTransform();
        $sheet.attr('aria-hidden', 'true');
    });
})($);

