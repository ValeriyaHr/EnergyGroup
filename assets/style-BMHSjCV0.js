(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const jQuery = window.jQuery || window.$;
if (typeof jQuery !== "function") {
  throw new Error("jQuery did not initialize as a function");
}
window.jQuery = jQuery;
window.$ = jQuery;
const $ = window.jQuery;
(() => {
  const openBtn = document.querySelector(".header__burger");
  const overlay = document.querySelector("#menuOverlay");
  const closeBtn = document.querySelector(".menuOverlay__close");
  if (!openBtn || !overlay || !closeBtn) return;
  const open = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth + "px";
    overlay.classList.add("is-open");
    document.body.classList.add("menu-open");
    overlay.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    overlay.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    document.body.style.paddingRight = "";
    overlay.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
  };
  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
$(function() {
  let $overlay = $("#menuOverlay");
  let $nav = $overlay.find(".menuOverlay__nav");
  $nav.on("click", ".menuItem--toggle", function(e) {
    e.preventDefault();
    let $btn = $(this);
    let $submenu = $("#" + $btn.attr("data-target"));
    let isOpen = $btn.attr("aria-expanded") === "true";
    $nav.find(".menuItem--toggle").not($btn).each(function() {
      let $other = $(this);
      let $otherSub = $("#" + $other.attr("data-target"));
      $other.attr("aria-expanded", "false").removeClass("is-open");
      $otherSub.attr("aria-hidden", "true");
    });
    if (isOpen) {
      $btn.attr("aria-expanded", "false").removeClass("is-open");
      $submenu.attr("aria-hidden", "true");
    } else {
      $btn.attr("aria-expanded", "true").addClass("is-open");
      $submenu.attr("aria-hidden", "false");
    }
  });
  $overlay.on("click", ".menuOverlay__close", function() {
    $nav.find(".menuItem--toggle").attr("aria-expanded", "false").removeClass("is-open");
    $nav.find(".menuSub").attr("aria-hidden", "true");
  });
  $nav.on("wheel", function(e) {
    let $element = $(this);
    let scrollTop = $element.scrollTop();
    let scrollHeight = $element.prop("scrollHeight");
    let clientHeight = $element.prop("clientHeight");
    let isAtTop = scrollTop === 0;
    let isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if (isAtTop && e.originalEvent.deltaY < 0 || isAtBottom && e.originalEvent.deltaY > 0) {
      return;
    }
    e.preventDefault();
    $element.scrollTop(scrollTop + e.originalEvent.deltaY);
  });
});
//# sourceMappingURL=style-BMHSjCV0.js.map
