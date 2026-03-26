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
        const $grid = $('#productsGrid');

        const OPEN_DRAG_RATIO = 0.45;
        const CLOSE_DRAG_RATIO = 0.25;
        const PEEK_VISIBLE_HEIGHT = 140;
        const MIN_PEEK_VISIBLE_HEIGHT = 56;
        const DRAG_START_THRESHOLD = 6;

        let dragContext = null;
        let lastTranslate = 0;
        let lastVisibleHeight = 0;
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
            const panelNode = $panel.get(0);
            const scrollHeight = panelNode ? Math.round(panelNode.scrollHeight || 0) : 0;
            const outerHeight = Math.round($panel.outerHeight() || 0);
            const measuredHeight = Math.max(scrollHeight, outerHeight);

            if (measuredHeight > 0) {
                return measuredHeight;
            }

            return Math.max(PEEK_VISIBLE_HEIGHT, MIN_PEEK_VISIBLE_HEIGHT);
        }

        function getPeekTranslate() {
            return 0;
        }

        function setSheetVisibleHeight(height) {
            const safeHeight = Math.max(0, Math.round(height || 0));
            lastVisibleHeight = safeHeight;
            $sheet.css('--mobile-sheet-visible-height', `${safeHeight}px`);
        }

        function getVisibleHeightByTranslate(translateY) {
            const panelHeight = getPanelHeight();
            const clampedTranslate = Math.max(0, Math.min(translateY || 0, panelHeight));
            return Math.max(0, panelHeight - clampedTranslate);
        }

        function getPeekVisibleHeight() {
            return Math.max(MIN_PEEK_VISIBLE_HEIGHT, Math.min(PEEK_VISIBLE_HEIGHT, getPanelHeight()));
        }

        function setTranslate(y) {
            const panelHeight = getPanelHeight();
            const clamped = Math.max(0, Math.min(y, panelHeight));
            lastTranslate = clamped;
            $panel.css('transform', `translate3d(0, ${clamped}px, 0)`);
            setSheetVisibleHeight(getVisibleHeightByTranslate(clamped));
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
                setSheetVisibleHeight(0);
                return;
            }

            if (isPeek) {
                const peekVisibleHeight = getPeekVisibleHeight();
                setSheetVisibleHeight(peekVisibleHeight);
                clearDragTransform();
                return;
            }

            clearDragTransform();
            setSheetVisibleHeight(getPanelHeight());
        }

        function queuePeekOnNextOpen() {
            if (!isMobileViewport()) return;
            if (dragContext) return;
            pendingPeekOnNextOpen = true;
        }

        function beginDrag(mode, startY) {
            const panelHeight = getPanelHeight();
            dragContext = {
                mode: mode,
                startY: startY,
                hasMoved: false,
                startTranslate: mode === 'opening' ? getPeekTranslate() : 0,
                startVisibleHeight: mode === 'opening' ? getPeekVisibleHeight() : panelHeight
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
                const nextVisibleHeight = Math.min(getPanelHeight(), dragContext.startVisibleHeight + dragUp);
                setSheetVisibleHeight(nextVisibleHeight);
                event.preventDefault();
                return;
            }

            const dragDown = Math.max(0, deltaY);
            const nextVisibleHeight = Math.max(0, dragContext.startVisibleHeight - dragDown);
            setSheetVisibleHeight(nextVisibleHeight);
            event.preventDefault();
        });

        $(document).on('touchend touchcancel', function (event) {
            if (!dragContext || !isMobileViewport()) return;

            const releaseY = getReleaseTouchY(event);
            const deltaY = releaseY - dragContext.startY;
            const panelHeight = getPanelHeight();

            if (dragContext.mode === 'opening') {
                const shouldOpen = lastVisibleHeight >= panelHeight * OPEN_DRAG_RATIO || deltaY < -70;
                $sheet.removeClass('is-dragging');
                $panel.removeClass('is-dragging');
                setSheetState(shouldOpen ? 'open' : 'peek');
                dragContext = null;
                return;
            }

            const hiddenHeight = Math.max(0, panelHeight - lastVisibleHeight);
            const shouldClose = hiddenHeight >= panelHeight * CLOSE_DRAG_RATIO || deltaY > 70;
            finishDrag(shouldClose);
        });

        $(document).on('click', '#btnShowDetails', function () {
            queuePeekOnNextOpen();
        });

        if ($grid.length) {
            $grid.on('click', '.productCard__bottom', function () {
                queuePeekOnNextOpen();
            });
        }

        // Swipe/drag from the handle area.
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
            setSheetState('closed');
        });

        window.addEventListener('resize', function () {
            if (!isMobileViewport()) {
                $sheet.removeClass('is-open is-dragging is-peek');
                $panel.removeClass('is-dragging');
                clearDragTransform();
                pendingPeekOnNextOpen = false;
                setSheetVisibleHeight(0);
                return;
            }

            if ($sheet.hasClass('is-peek')) {
                setSheetState('peek');
                return;
            }

            if ($sheet.hasClass('is-open')) {
                setSheetVisibleHeight(getPanelHeight());
            }
        });

        // Safe initial state.
        $sheet.removeClass('is-open is-dragging is-peek');
        $panel.removeClass('is-dragging');
        clearDragTransform();
        setSheetVisibleHeight(0);
        $sheet.attr('aria-hidden', 'true');
    });
})($);

