function openModal(id) {
  $("#" + id).addClass("is-open");
  $("body").addClass("no-scroll");
}
function closeModal(id) {
  $("#" + id).removeClass("is-open");
  $("body").removeClass("no-scroll");
}
(function initAzCalculator() {
  const $modal = $("#calc-modal");
  const $resultModal = $("#calc-modal-result");
  if ($modal.length === 0 || $resultModal.length === 0) return;
  $(document).on("click", ".calc-modal__close", function(e) {
    e.stopPropagation();
    const $modal2 = $(this).closest("#calc-modal, #calc-modal-result");
    if ($modal2.length) {
      const modalId = $modal2.attr("id");
      if (modalId) {
        closeModal(modalId);
      }
    }
  });
  $(document).on("click", ".calc-modal__overlay", function(e) {
    e.stopPropagation();
    const $modal2 = $(this).closest(".calc-modal");
    if ($modal2.length) {
      closeModal($modal2.attr("id"));
    }
  });
  $(document).on("click", "[data-calc-open]", function() {
    openModal("calc-modal");
  });
  $("#calc-form");
})();
//# sourceMappingURL=calc-1VCruqwV.js.map
