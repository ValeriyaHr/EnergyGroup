(function($2) {
  $2(function() {
    function isMobileView() {
      return window.matchMedia("(max-width: 768px)").matches;
    }
    var $panel = $2(".mobile_panel");
    var $grid = $2("#productsGrid");
    var $buttons = $panel.find(".mobile_panel__btn");
    if (!$panel.length || !$grid.length) return;
    function switchMobileCardImages(viewMode) {
      if (!isMobileView()) return;
      $grid.find(".productCard__imgWrap").each(function() {
        var $wrap = $2(this);
        var $source = $wrap.find("source").first();
        var $img = $wrap.find("img").first();
        if (!$source.length || !$img.length) return;
        if (!$source.attr("data-mob-src")) {
          $source.attr("data-mob-src", $source.attr("srcset") || "");
        }
        var mobSrc = $source.attr("data-mob-src") || "";
        var mob2Src = mobSrc.replace(/-mob\./, "-mob2.");
        var finalSrc = viewMode === "double" ? mob2Src : mobSrc;
        $source.attr("srcset", finalSrc);
        $img.attr("src", finalSrc);
      });
    }
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
      switchMobileCardImages(viewMode);
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
      } else {
        switchMobileCardImages("single");
      }
    } catch (e) {
    }
    $2(window).on("resize", function() {
      var mode = $grid.hasClass("view-double") ? "double" : "single";
      switchMobileCardImages(mode);
    });
  });
})(jQuery);
$(function() {
  const $wrap = $("#productDetails");
  let lastUrl = null;
  let isLoaded = false;
  let isOpen = false;
  let wheelArmed = true;
  function getProductIdFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const queryProduct = params.get("product");
    if (queryProduct && /^p\d{2}$/i.test(queryProduct)) {
      return queryProduct.toLowerCase();
    }
    const hashMatch = window.location.hash.match(/p\d{2}/i);
    return hashMatch ? hashMatch[0].toLowerCase() : null;
  }
  function setProductLocation(productId) {
    if (!window.history || !window.history.replaceState) return;
    const url = new URL(window.location.href);
    if (productId) {
      url.searchParams.set("product", productId);
      url.hash = productId;
    } else {
      url.searchParams.delete("product");
      url.hash = "";
    }
    window.history.replaceState({}, "", url.toString());
  }
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
    setProductLocation(null);
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
    setProductLocation(productId);
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
  const initialProductId = getProductIdFromLocation();
  if (initialProductId) {
    loadProduct(`./product-details/${initialProductId}.html`);
  }
});
(function($2) {
  $2(function() {
    var $previewSection = $2(".previewProduct");
    var $img = $2("#previewProductImage");
    var $title = $2("#previewProductTitle");
    var $desc = $2("#previewProductDesc");
    var $btnDetails = $2("#btnShowDetails");
    var $calculatorBtn = $2("#calculator_btn");
    var $grid = $2("#productsGrid");
    if (!$previewSection.length || !$img.length || !$title.length || !$desc.length || !$btnDetails.length || !$grid.length) {
      return;
    }
    var $cards = $grid.find(".productCard");
    var heroTypes = [
      "previewProduct--cabinet",
      "previewProduct--module",
      "previewProduct--tall",
      "previewProduct--wide"
    ];
    var productTypes = {
      p01: "cabinet",
      p02: "module",
      p03: "tall",
      p04: "tall",
      p05: "module",
      p06: "cabinet",
      p07: "wide",
      p08: "module",
      p09: "cabinet",
      p10: "cabinet",
      p11: "wide",
      p12: "module",
      p13: "tall"
    };
    function getProductType($card, productId) {
      return $card.data("type") || productTypes[productId] || "cabinet";
    }
    function setPreviewType(type) {
      $previewSection.removeClass(heroTypes.join(" "));
      if (type) {
        $previewSection.addClass("previewProduct--" + type);
      }
    }
    function setPreviewState(productId, productType) {
      setPreviewType(productType);
      $previewSection.attr("data-product-id", productId || "");
      $btnDetails.attr("data-product", productId || "").attr("data-type", productType || "").data("product", productId || "");
    }
    function toggleCalculator(productId) {
      if (!$calculatorBtn.length) return;
      if (productId === "p03") {
        $calculatorBtn.removeClass("hide");
      } else {
        $calculatorBtn.addClass("hide");
      }
    }
    function readCardData($card) {
      if (!$card.length) return null;
      var productId = $card.data("details");
      var productType = getProductType($card, productId);
      return {
        previewSrc: $card.data("preview"),
        title: $card.find(".productCard__title").text().trim(),
        text: $card.find(".productCard__text").text().trim(),
        productId,
        productType
      };
    }
    function setPreview(src, title, desc, productId, productType) {
      if (!src) return;
      $img.css("opacity", 0);
      $title.css("opacity", 0);
      $desc.css("opacity", 0);
      toggleCalculator(productId);
      window.setTimeout(function() {
        $img.attr("src", src);
        if (title) $title.text(title);
        if (desc) $desc.text(desc);
        setPreviewState(productId, productType);
        $img.css("opacity", 1);
        $title.css("opacity", 1);
        $desc.css("opacity", 1);
      }, 90);
    }
    $grid.on("mouseover focusin click", function(e) {
      var $card = $2(e.target).closest(".productCard");
      if (!$card.length) return;
      var cardData = readCardData($card);
      if (!cardData) return;
      setPreview(
        cardData.previewSrc,
        cardData.title,
        cardData.text,
        cardData.productId,
        cardData.productType
      );
      $cards.index($card);
    });
    $grid.on("mouseleave", function() {
    });
    $grid.on("click", ".productCard__link", function(e) {
      e.preventDefault();
      return false;
    });
    $grid.on("click", ".productCard__bottom", function(e) {
      e.preventDefault();
      var $card = $2(this).closest(".productCard");
      if (!$card.length) return;
      var cardData = readCardData($card);
      if (!cardData) return;
      setPreview(
        cardData.previewSrc,
        cardData.title,
        cardData.text,
        cardData.productId,
        cardData.productType
      );
      $cards.index($card);
      $2(".productDetails__back").click();
      window.setTimeout(function() {
        $2("#btnShowDetails").click();
      }, 150);
    });
    setPreviewState("p01", "cabinet");
    toggleCalculator("p01");
  });
})(jQuery);
//# sourceMappingURL=productsJs-DWTmcto7.js.map
