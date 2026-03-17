const modalRoot = document.getElementById("engReqModal");

if (modalRoot) {
    const closeButtons = Array.from(modalRoot.querySelectorAll("[data-eng-request-close]"));
    const dialog = modalRoot.querySelector(".engReqModal__dialog");
    const firstInput = modalRoot.querySelector(".engReqModal__input");
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

    const openModal = () => {
        document.body.classList.add("engReqModalOpen");
        modalRoot.setAttribute("aria-hidden", "false");
        if (firstInput) {
            window.requestAnimationFrame(() => firstInput.focus());
        }
    };

    const closeModal = () => {
        document.body.classList.remove("engReqModalOpen");
        modalRoot.setAttribute("aria-hidden", "true");
    };

    document.addEventListener("click", (event) => {
        const openTrigger = event.target.closest("[data-eng-request-open]");
        if (!openTrigger) {
            return;
        }

        event.preventDefault();
        openModal();
    });

    document.addEventListener("keydown", (event) => {
        const openTrigger = event.target.closest("[data-eng-request-open]");
        if (!openTrigger || (event.key !== "Enter" && event.key !== " ")) {
            return;
        }

        event.preventDefault();
        openModal();
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    modalRoot.addEventListener("click", (event) => {
        if (!dialog || dialog.contains(event.target)) {
            return;
        }
        closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && document.body.classList.contains("engReqModalOpen")) {
            closeModal();
        }
    });
}

