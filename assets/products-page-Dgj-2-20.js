import "./style-BMHSjCV0.js";
const $$1 = window.jQuery;
function toNum(v) {
  const n = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function openModal(id) {
  $$1("#" + id).addClass("is-open");
  $$1("body").addClass("no-scroll");
}
function closeModal(id) {
  $$1("#" + id).removeClass("is-open");
  $$1("body").removeClass("no-scroll");
}
function ShowCalcResult() {
  const inom = toNum($$1("#inom").val());
  const rho = toNum($$1("#rho").val());
  console.log("inom=" + inom);
  console.log("rho=" + rho);
  if (inom === null || rho === null || inom <= 0 || rho <= 0) {
    alert("Перевір числа: мають бути > 0 (можна 4,0 або 4.0).");
    return;
  }
  const U_skz_max = 50;
  const K_zapas_U = 1.5;
  const K_zapas_R = 1.3;
  const K_season = 1.3;
  const K_ekr = 0.75;
  const V_anod = 0.02;
  const T_years = 20;
  const K_nerivn = 2;
  const M_core = 6;
  const U_start = U_skz_max / K_zapas_U;
  const R_calc = U_start / inom;
  const R_start = R_calc / K_zapas_R;
  const Ri_base = 5 * 0.1 * rho;
  const Ri = Ri_base * K_season;
  const N_electr = Ri / R_start;
  const N_fact = N_electr / K_ekr;
  const M_az = V_anod * T_years * inom * K_nerivn;
  const N_by_mass = M_az / M_core;
  const N_final = Math.ceil(Math.max(N_fact, N_by_mass));
  $$1("#calc-result-value").text(String(N_final));
  closeModal("calc-modal");
  openModal("calc-modal-result");
}
window.openModal = openModal;
window.closeModal = closeModal;
window.ShowCalcResult = ShowCalcResult;
(function initAzCalculator() {
  const $modal = $$1("#calc-modal");
  const $resultModal = $$1("#calc-modal-result");
  if ($modal.length === 0 || $resultModal.length === 0) return;
  $$1(document).on("click", ".calc-modal__close", function(e) {
    e.stopPropagation();
    const $modal2 = $$1(this).closest("#calc-modal, #calc-modal-result");
    if ($modal2.length) {
      const modalId = $modal2.attr("id");
      if (modalId) {
        closeModal(modalId);
      }
    }
  });
  $$1(document).on("click", ".calc-modal__overlay", function(e) {
    e.stopPropagation();
    const $modal2 = $$1(this).closest(".calc-modal");
    if ($modal2.length) {
      closeModal($modal2.attr("id"));
    }
  });
  $$1(document).on("click", "[data-calc-open]", function() {
    openModal("calc-modal");
  });
  $$1("#calc-form");
})();
const $ = window.jQuery;
(function($2) {
  if (!$2) return;
  $2(function() {
    function isMobileView() {
      return window.matchMedia("(max-width: 768px)").matches;
    }
    let $panel = $2(".mobile_panel");
    let $grid = $2("#productsGrid");
    let $buttons = $panel.find(".mobile_panel__btn");
    if (!$panel.length || !$grid.length) return;
    function switchMobileCardImages(viewMode) {
      if (!isMobileView()) return;
      $grid.find(".productCard__imgWrap").each(function() {
        let $wrap = $2(this);
        let $source = $wrap.find("source").first();
        let $img = $wrap.find("img").first();
        if (!$source.length || !$img.length) return;
        if (!$source.attr("data-mob-src")) {
          $source.attr("data-mob-src", $source.attr("srcset") || "");
        }
        let mobSrc = $source.attr("data-mob-src") || "";
        let mob2Src = mobSrc.replace(/-mob\./, "-mob2.");
        let finalSrc = viewMode === "double" ? mob2Src : mobSrc;
        $source.attr("srcset", finalSrc);
        $img.attr("src", finalSrc);
      });
    }
    $buttons.on("click", function(e) {
      e.preventDefault();
      let $btn = $2(this);
      let viewMode = $btn.data("view");
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
      let savedMode = localStorage.getItem("productsViewMode");
      if (savedMode) {
        let $savedBtn = $buttons.filter('[data-view="' + savedMode + '"]');
        if ($savedBtn.length) {
          $savedBtn.click();
        }
      } else {
        switchMobileCardImages("single");
      }
    } catch (e) {
    }
    $2(window).on("resize", function() {
      let mode = $grid.hasClass("view-double") ? "double" : "single";
      switchMobileCardImages(mode);
    });
  });
})($);
if ($) $(function() {
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
if ($) $(function() {
  let $previewSection = $(".previewProduct");
  let $img = $("#previewProductImage");
  let $title = $("#previewProductTitle");
  let $desc = $("#previewProductDesc");
  let $btnDetails = $("#btnShowDetails");
  let $calculatorBtn = $("#calculator_btn");
  let $grid = $("#productsGrid");
  if (!$previewSection.length || !$img.length || !$title.length || !$desc.length || !$btnDetails.length || !$grid.length) {
    return;
  }
  let $cards = $grid.find(".productCard");
  let heroTypes = [
    "previewProduct--cabinet",
    "previewProduct--module",
    "previewProduct--tall",
    "previewProduct--wide"
  ];
  let productTypes = {
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
    let productId = $card.data("details");
    let productType = getProductType($card, productId);
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
      $img.attr("src", src + "?" + Date.now());
      if (title) $title.text(title);
      if (desc) $desc.text(desc);
      setPreviewState(productId, productType);
      $img.css("opacity", 1);
      $title.css("opacity", 1);
      $desc.css("opacity", 1);
    }, 90);
  }
  $grid.on("mouseover focusin click", function(e) {
    let $card = $(e.target).closest(".productCard");
    if (!$card.length) return;
    let cardData = readCardData($card);
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
    let $card = $(this).closest(".productCard");
    if (!$card.length) return;
    let cardData = readCardData($card);
    if (!cardData) return;
    console.log(cardData);
    setPreview(
      cardData.previewSrc,
      cardData.title,
      cardData.text,
      cardData.productId,
      cardData.productType
    );
    $cards.index($card);
    $(".productDetails__back").click();
    window.setTimeout(function() {
      $("#btnShowDetails").click();
    }, 150);
  });
  setPreviewState("p01", "cabinet");
  toggleCalculator("p01");
});
//# sourceMappingURL=products-page-Dgj-2-20.js.map
