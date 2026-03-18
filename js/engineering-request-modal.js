const DEFAULT_MODAL_ID = "engReqModal";
const initializedModals = new WeakSet();

function syncBodyModalState() {
    const hasOpenedModal = Boolean(document.querySelector(".engReqModal[aria-hidden='false']"));
    document.body.classList.toggle("engReqModalOpen", hasOpenedModal);
}

function closeModal(modalRoot) {
    if (!modalRoot) {
        return;
    }
    modalRoot.setAttribute("aria-hidden", "true");
    syncBodyModalState();
}

function setupModal(modalRoot) {
    if (!modalRoot || initializedModals.has(modalRoot)) {
        return;
    }

    const dialog = modalRoot.querySelector(".engReqModal__dialog");
    const messageField = modalRoot.querySelector("textarea[name='eng_message']");
    const mobileMedia = window.matchMedia("(max-width: 768px)");
    const desktopPlaceholder = modalRoot.dataset.placeholderDesktop || messageField?.getAttribute("placeholder") || "ОПИШІТЬ, ЧИМ МИ МОЖЕМО ВАМ ДОПОМОГТИ *";
    const mobilePlaceholder = modalRoot.dataset.placeholderMobile || desktopPlaceholder;

    const syncMessagePlaceholder = () => {
        if (!messageField) {
            return;
        }
        messageField.placeholder = mobileMedia.matches ? mobilePlaceholder : desktopPlaceholder;
    };

    syncMessagePlaceholder();

    if (typeof mobileMedia.addEventListener === "function") {
        mobileMedia.addEventListener("change", syncMessagePlaceholder);
    } else if (typeof mobileMedia.addListener === "function") {
        mobileMedia.addListener(syncMessagePlaceholder);
    }

    modalRoot.addEventListener("click", (event) => {
        if (!dialog || dialog.contains(event.target)) {
            return;
        }
        closeModal(modalRoot);
    });

    const closeButtons = Array.from(modalRoot.querySelectorAll("[data-eng-request-close]"));
    closeButtons.forEach((button) => {
        button.addEventListener("click", () => closeModal(modalRoot));
    });

    initializedModals.add(modalRoot);
}

function openModal(modalRoot) {
    if (!modalRoot) {
        return;
    }

    setupModal(modalRoot);
    modalRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("engReqModalOpen");

    const firstInput = modalRoot.querySelector(".engReqModal__input");
    if (firstInput) {
        window.requestAnimationFrame(() => firstInput.focus());
    }
}

function resolveModalFromTrigger(trigger) {
    const targetId = trigger?.getAttribute("data-eng-request-target")?.trim();
    if (targetId) {
        const targetModal = document.getElementById(targetId);
        if (targetModal) {
            return targetModal;
        }
    }
    return document.getElementById(DEFAULT_MODAL_ID);
}

document.addEventListener("click", (event) => {
    const openTrigger = event.target.closest("[data-eng-request-open]");
    if (!openTrigger) {
        return;
    }

    const modalRoot = resolveModalFromTrigger(openTrigger);
    if (!modalRoot) {
        return;
    }

    event.preventDefault();
    openModal(modalRoot);
});

document.addEventListener("keydown", (event) => {
    const openTrigger = event.target.closest("[data-eng-request-open]");
    if (!openTrigger || (event.key !== "Enter" && event.key !== " ")) {
        return;
    }

    const modalRoot = resolveModalFromTrigger(openTrigger);
    if (!modalRoot) {
        return;
    }

    event.preventDefault();
    openModal(modalRoot);
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    const openedModals = document.querySelectorAll(".engReqModal[aria-hidden='false']");
    openedModals.forEach((modalRoot) => closeModal(modalRoot));
});

