$(function() {
  const $wrap = $("#productDetails");
  let lastUrl = null;
  let isLoaded = false;
  let isOpen = false;
  let wheelArmed = true;
  function openDetails() {
    if (!isLoaded) return;
    $wrap.addClass("is-ready");
    requestAnimationFrame(() => {
      $wrap.addClass("is-open");
      isOpen = true;
      $("html, body").stop().animate({
        scrollTop: $wrap.offset().top - 60
      }, 350);
    });
  }
  function closeDetails() {
    $wrap.removeClass("is-open");
    isOpen = false;
    setTimeout(() => {
      $wrap.removeClass("is-ready").empty();
      isLoaded = false;
      lastUrl = null;
    }, 350);
  }
  function loadProduct(url) {
    if (isLoaded && url === lastUrl) {
      openDetails();
      return;
    }
    isLoaded = false;
    isOpen = false;
    lastUrl = url;
    $wrap.removeClass("is-open is-ready").hide().empty();
    $wrap.load(url, function(response, status) {
      if (status === "error") {
        $wrap.show().addClass("is-ready").html("<p>Помилка завантаження</p>");
        return;
      }
      isLoaded = true;
      $wrap.show();
      openDetails();
    });
  }
  $(document).on("click", ".productDetails__back", function(e) {
    e.preventDefault();
    closeDetails();
  });
  $(document).on("click", ".js-open-product", function(e) {
    e.preventDefault();
    const productId = $(this).data("product");
    const url = `./product-details/${productId}.html`;
    loadProduct(url);
    wheelArmed = true;
  });
  $(window).on("wheel", function(e) {
    const deltaY = e.originalEvent.deltaY;
    if (deltaY <= 0) return;
    if (!isLoaded || isOpen) return;
    if (!wheelArmed) return;
    wheelArmed = false;
    openDetails();
    setTimeout(() => wheelArmed = true, 800);
  });
  $(document).on("keydown", function(e) {
    if (e.key === "Escape") closeDetails();
  });
});
//# sourceMappingURL=productsJs-7In4NRz1.js.map
