(function($2) {
  $2(function() {
    var $panel = $2(".mobile_panel");
    var $grid = $2("#productsGrid");
    var $buttons = $panel.find(".mobile_panel__btn");
    if (!$panel.length || !$grid.length) return;
    $buttons.on("click", function(e) {
      e.preventDefault();
      var $btn = $2(this);
      var viewMode = $btn.data("view");
      $buttons.removeClass("active");
      $btn.addClass("active");
      $grid.removeClass("view-single view-double");
      if (viewMode === "single") {
        $grid.addClass("view-single");
      } else if (viewMode === "double") {
        $grid.addClass("view-double");
      }
      try {
        localStorage.setItem("productsViewMode", viewMode);
      } catch (e2) {
      }
    });
    try {
      var savedMode = localStorage.getItem("productsViewMode");
      if (savedMode) {
        var $savedBtn = $buttons.filter('[data-view="' + savedMode + '"]');
        if ($savedBtn.length) {
          $savedBtn.click();
        }
      }
    } catch (e) {
    }
  });
})(jQuery);
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
//# sourceMappingURL=productsJs-DHtIPY7D.js.map
