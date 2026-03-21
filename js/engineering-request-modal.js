const DEFAULT_MODAL_ID = "engReqModal";
const initializedModals = new WeakSet();

function hasCyrillic(text) {
    return /[А-Яа-яІіЇїЄєҐґ]/.test(String(text || ""));
}

function buildSuccessMarkup(isUaLocale) {
    if (isUaLocale) {
        return {
            lead: "ДЯКУЄМО. ВАШ ЗАПИТ ОТРИМАНО.<br>МИ ЗВ'ЯЖЕМОСЯ З ВАМИ НАЙБЛИЖЧИМ ЧАСОМ.<br>ЦЕЙ ЗАПИТ НЕ Є КОМЕРЦІЙНОЮ ПРОПОЗИЦІЄЮ.",
            note: "Фінальна вартість визначається після виїзду на об'єкт та узгодження технічних вимог."
        };
    }

    return {
        lead: "THANK YOU. YOUR REQUEST HAS BEEN RECEIVED.<br>WE WILL CONTACT YOU SHORTLY.<br>THIS REQUEST DOES NOT CONSTITUTE A COMMERCIAL OFFER.",
        note: "The final cost is determined after site inspection and approval of the technical requirements."
    };
}

function ensureSuccessBlock(modalRoot, formElement, isUaLocale) {
    if (!modalRoot || !formElement) {
        return null;
    }

    let successBlock = modalRoot.querySelector(".engReqModal__success");
    if (successBlock) {
        return successBlock;
    }

    const successText = buildSuccessMarkup(isUaLocale);
    successBlock = document.createElement("div");
    successBlock.className = "engReqModal__success";
    successBlock.setAttribute("aria-live", "polite");
    successBlock.setAttribute("aria-hidden", "true");
    successBlock.innerHTML = `
        <p class="engReqModal__successLead">${successText.lead}</p>
        <p class="engReqModal__successNote">${successText.note}</p>
    `;

    // Insert INSIDE the dialog box so success text appears on the dark background
    const dialog = modalRoot.querySelector(".engReqModal__dialog");
    if (dialog) {
        dialog.appendChild(successBlock);
    } else {
        formElement.insertAdjacentElement("afterend", successBlock);
    }
    return successBlock;
}

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
    const formElement = modalRoot.querySelector(".engReqModal__form");
    const messageField = modalRoot.querySelector("textarea[name='eng_message']");
    const mobileMedia = window.matchMedia("(max-width: 768px)");
    const desktopPlaceholder = modalRoot.dataset.placeholderDesktop || messageField?.getAttribute("placeholder") || "ОПИШІТЬ, ЧИМ МИ МОЖЕМО ВАМ ДОПОМОГТИ *";
    const mobilePlaceholder = modalRoot.dataset.placeholderMobile || desktopPlaceholder;
    const isUaLocale = hasCyrillic(desktopPlaceholder);
    const successBlock = ensureSuccessBlock(modalRoot, formElement, isUaLocale);

    const syncMessagePlaceholder = () => {
        if (!messageField) {
            return;
        }
        messageField.placeholder = mobileMedia.matches ? mobilePlaceholder : desktopPlaceholder;
    };

    syncMessagePlaceholder();

    const resetSubmitState = () => {
        modalRoot.classList.remove("is-success");

        if (formElement) {
            formElement.removeAttribute("aria-hidden");
        }

        if (successBlock) {
            successBlock.setAttribute("aria-hidden", "true");
        }
    };

    resetSubmitState();

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

    if (formElement && successBlock) {
        formElement.addEventListener("submit", (event) => {
            if (!formElement.checkValidity()) {
                return;
            }

            event.preventDefault();
            formElement.setAttribute("aria-hidden", "true");
            modalRoot.classList.add("is-success");
            successBlock.setAttribute("aria-hidden", "false");
            formElement.reset();
            syncMessagePlaceholder();
        });
    }

    initializedModals.add(modalRoot);
}

function openModal(modalRoot) {
    if (!modalRoot) {
        return;
    }

    setupModal(modalRoot);
    modalRoot.classList.remove("is-success");

    const formElement = modalRoot.querySelector(".engReqModal__form");
    if (formElement) {
        formElement.removeAttribute("aria-hidden");
    }

    const successBlock = modalRoot.querySelector(".engReqModal__success");
    if (successBlock) {
        successBlock.setAttribute("aria-hidden", "true");
    }

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

