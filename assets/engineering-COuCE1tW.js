import "./menu-DC5sL17k.js";
/* empty css               */
const modalRoot = document.getElementById("engReqModal");
if (modalRoot) {
  const openButtons = Array.from(document.querySelectorAll("[data-eng-request-open]"));
  const closeButtons = Array.from(modalRoot.querySelectorAll("[data-eng-request-close]"));
  const dialog = modalRoot.querySelector(".engReqModal__dialog");
  const firstInput = modalRoot.querySelector(".engReqModal__input");
  const messageField = modalRoot.querySelector("textarea[name='eng_message']");
  const mobileMedia = window.matchMedia("(max-width: 768px)");
  const desktopPlaceholder = "ОПИШІТЬ, ЧИМ МИ МОЖЕМО ВАМ ДОПОМОГТИ *";
  const mobilePlaceholder = "КОРОТКИЙ ОПИС";
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
  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
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
//# sourceMappingURL=engineering-COuCE1tW.js.map
