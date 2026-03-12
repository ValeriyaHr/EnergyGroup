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
function isMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}
const counterEl = document.querySelector("#counter");
if (counterEl && typeof window.setupCounter === "function") {
  window.setupCounter(counterEl);
}
async function includePart(el) {
  const url = el.getAttribute("data-include");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Include failed: ${url}`);
  el.outerHTML = await res.text();
}
async function includeAll() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all([...nodes].map(includePart));
}
document.addEventListener("DOMContentLoaded", () => {
  includeAll().then(() => {
    initWhyUsUnfold();
    if (typeof initSmoothAnchorScroll === "function") initSmoothAnchorScroll();
    initExperienceAnimation();
  }).catch(console.error);
});
const WHITE_ARROW = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";
const ORANGE_ARROW = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23f80%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";
document.querySelectorAll(".engRow__arrowIcon").forEach((img) => {
  img.src = WHITE_ARROW;
});
document.addEventListener("click", (e) => {
  var _a;
  const row = e.target.closest(".js-engRow");
  if (!row) return;
  const panel = ((_a = row.nextElementSibling) == null ? void 0 : _a.classList.contains("js-engPanel")) ? row.nextElementSibling : null;
  if (!panel) return;
  const icon = row.querySelector(".engRow__arrowIcon");
  const isOpen = row.classList.toggle("is-open");
  row.setAttribute("aria-expanded", String(isOpen));
  if (icon) icon.src = isOpen ? ORANGE_ARROW : WHITE_ARROW;
  const item = row.closest(".engItem");
  if (item) item.classList.toggle("is-open", isOpen);
  panel.hidden = !isOpen;
  panel.classList.toggle("is-open", isOpen);
});
function initWhyUsUnfold() {
  var _a, _b;
  const root = document.querySelector("#whyReveal");
  if (!root) return;
  const items = root.querySelectorAll(".whyItem");
  if (!items.length) return;
  root.style.setProperty("--count", String(items.length));
  if ((_b = (_a = window.matchMedia) == null ? void 0 : _a.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : _b.matches) {
    root.style.setProperty("--p", "1");
    return;
  }
  let raf = 0;
  let active = false;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const update = () => {
    raf = 0;
    if (!active) return;
    const r = root.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const start = vh * 0.95;
    const end = vh * 0.05;
    const p = clamp01((start - r.top) / (start - end));
    root.style.setProperty("--p", p.toFixed(4));
  };
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(
    (entries) => {
      const isIn = entries.some((e) => e.isIntersecting);
      if (isIn && !active) {
        active = true;
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
      } else if (!isIn && active) {
        active = false;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    },
    { rootMargin: "200px 0px 200px 0px", threshold: 0.01 }
  );
  io.observe(root);
}
function initExperienceAnimation() {
  const experienceSection = document.querySelector(".experience");
  const expGrid = document.querySelector(".expGrid");
  if (!experienceSection || !expGrid) return;
  const expRows = expGrid.querySelectorAll(".expRow");
  if (!expRows.length) return;
  let hasAnimated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateExperienceRowsSequential(expRows);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(experienceSection);
}
function parseNumber(str) {
  const match = str.match(/[\d\s]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/\s/g, ""), 10);
}
function animateCounter(element, finalValue, duration = 1800) {
  const startValue = 0;
  const startTime = Date.now();
  const originalText = element.textContent;
  const suffix = originalText.replace(/[\d\s]/g, "");
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOut);
    const formattedValue = currentValue.toLocaleString("uk-UA").replace(/\s/g, " ");
    element.textContent = formattedValue + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  update();
}
function animateSingleRow(row) {
  return new Promise((resolve) => {
    row.classList.add("is-active");
    const expNum = row.querySelector(".expNum");
    if (expNum) {
      expNum.classList.add("is-highlight");
      const finalValue = parseNumber(expNum.textContent);
      if (finalValue > 0) {
        animateCounter(expNum, finalValue, 1800);
      }
      setTimeout(() => {
        expNum.classList.remove("is-highlight");
      }, 1900);
    }
    setTimeout(() => {
      resolve();
    }, 2e3);
  });
}
async function animateExperienceRowsSequential(expRows) {
  for (let i = 0; i < expRows.length; i++) {
    await animateSingleRow(expRows[i]);
  }
}
function initExperienceMobileAnimation() {
  const experienceSection = document.querySelector(".experience");
  const experienceStats = document.querySelector(".experienceStats");
  if (!experienceSection || !experienceStats) return;
  const experienceStatItems = experienceStats.querySelectorAll(".experienceStat");
  if (!experienceStatItems.length) return;
  let hasAnimated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateMobileExperienceRowsSequential(experienceStatItems);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(experienceSection);
}
function animateSingleMobileRow(stat) {
  return new Promise((resolve) => {
    stat.classList.add("is-active");
    const expBig = stat.querySelector(".experience__big");
    if (expBig) {
      expBig.classList.add("is-highlight");
      const finalValue = parseNumber(expBig.textContent);
      if (finalValue > 0) {
        animateCounter(expBig, finalValue, 1800);
      }
      setTimeout(() => {
        expBig.classList.remove("is-highlight");
      }, 1900);
    }
    setTimeout(() => {
      resolve();
    }, 2e3);
  });
}
async function animateMobileExperienceRowsSequential(experienceStatItems) {
  for (let i = 0; i < experienceStatItems.length; i++) {
    await animateSingleMobileRow(experienceStatItems[i]);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".experienceStats")) {
    if (isMobileView()) {
      initExperienceMobileAnimation();
    }
  }
  initTicsAnimation();
});
function initTicsAnimation() {
  var _a;
  const section = document.querySelector(".engSection");
  const card = section == null ? void 0 : section.querySelector(".engSection__card");
  const ticsElement = document.querySelector(".engSection__ticks");
  const secondRow = (_a = section == null ? void 0 : section.querySelectorAll(".engSolRow")) == null ? void 0 : _a[1];
  if (!section || !card || !ticsElement || !secondRow) return;
  let ticking = false;
  let inView = false;
  let latestDelta = 0;
  let animationRaf = 0;
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let currentRotation = 0;
  let targetRotation = 0;
  const MAX_DELTA_DESKTOP = 150;
  const MAX_DELTA_MOBILE = 110;
  const MAX_ROTATION_DESKTOP = 46;
  const MAX_ROTATION_MOBILE = 34;
  const ROTATE_STEP_DESKTOP = 0.23;
  const ROTATE_STEP_MOBILE = 0.18;
  const SMOOTHING = 0.18;
  function setNeutralState() {
    ticsElement.style.setProperty("--eng-ticks-scroll-rotate", "0deg");
    ticsElement.style.setProperty("--eng-ticks-scroll-shift-y", "0px");
    ticsElement.style.setProperty("--eng-ticks-scroll-scale", "1");
  }
  setNeutralState();
  function updateTicsPlacement() {
    const mobileView = isMobileView();
    const target = mobileView ? secondRow.querySelector(".engSolRow__num") : secondRow.querySelector(".engSolRow__center");
    if (!target) return;
    const cardRect = card.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const baseCenterX = targetRect.left - cardRect.left + targetRect.width / 2;
    const baseCenterY = targetRect.top - cardRect.top + targetRect.height / 2;
    const centerX = mobileView ? baseCenterX - targetRect.width * 0.52 : baseCenterX;
    const centerY = mobileView ? baseCenterY - targetRect.height * 0.14 : baseCenterY;
    const baseSize = Math.max(targetRect.width, targetRect.height);
    const size = mobileView ? Math.max(targetRect.height * 2.85, 320) : Math.max(baseSize * 2.15, 920);
    ticsElement.style.left = `${centerX.toFixed(2)}px`;
    ticsElement.style.top = `${centerY.toFixed(2)}px`;
    ticsElement.style.width = `${size.toFixed(2)}px`;
  }
  function applyMotionByDelta(deltaY) {
    if (!inView) {
      setNeutralState();
      return;
    }
    const mobileView = isMobileView();
    const maxDelta = mobileView ? MAX_DELTA_MOBILE : MAX_DELTA_DESKTOP;
    const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaY));
    const maxRotation = mobileView ? MAX_ROTATION_MOBILE : MAX_ROTATION_DESKTOP;
    const rotateStep = mobileView ? ROTATE_STEP_MOBILE : ROTATE_STEP_DESKTOP;
    targetRotation += clampedDelta * rotateStep;
    targetRotation = Math.max(-maxRotation, Math.min(maxRotation, targetRotation));
  }
  function animateRotation() {
    if (!inView) {
      animationRaf = 0;
      return;
    }
    const diff = targetRotation - currentRotation;
    currentRotation += diff * SMOOTHING;
    targetRotation *= 0.92;
    if (Math.abs(targetRotation) < 0.08) targetRotation = 0;
    if (Math.abs(currentRotation) < 0.06 && targetRotation === 0) currentRotation = 0;
    ticsElement.style.setProperty("--eng-ticks-scroll-rotate", `${currentRotation.toFixed(2)}deg`);
    ticsElement.style.setProperty("--eng-ticks-scroll-shift-y", "0px");
    ticsElement.style.setProperty("--eng-ticks-scroll-scale", "1");
    if (Math.abs(currentRotation) > 0 || Math.abs(targetRotation) > 0) {
      animationRaf = window.requestAnimationFrame(animateRotation);
    } else {
      animationRaf = 0;
    }
  }
  function requestTickUpdate() {
    const currentY = window.scrollY || window.pageYOffset || 0;
    latestDelta = currentY - lastScrollY;
    lastScrollY = currentY;
    if (!inView || latestDelta === 0) return;
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      applyMotionByDelta(latestDelta);
      if (!animationRaf) {
        animationRaf = window.requestAnimationFrame(animateRotation);
      }
    });
  }
  updateTicsPlacement();
  window.addEventListener("resize", () => {
    updateTicsPlacement();
    currentRotation = 0;
    targetRotation = 0;
    setNeutralState();
  });
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !inView) {
        inView = true;
        lastScrollY = window.scrollY || window.pageYOffset || 0;
        window.addEventListener("scroll", requestTickUpdate, { passive: true });
      } else if (!visible && inView) {
        inView = false;
        window.removeEventListener("scroll", requestTickUpdate);
        if (animationRaf) {
          window.cancelAnimationFrame(animationRaf);
          animationRaf = 0;
        }
        currentRotation = 0;
        targetRotation = 0;
        setNeutralState();
      }
    },
    { rootMargin: "200px 0px 200px 0px", threshold: 0.01 }
  );
  observer.observe(section);
}
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
  var $overlay = $("#menuOverlay");
  var $nav = $overlay.find(".menuOverlay__nav");
  $nav.on("click", ".menuItem--toggle", function(e) {
    e.preventDefault();
    var $btn = $(this);
    var $submenu = $("#" + $btn.attr("data-target"));
    var isOpen = $btn.attr("aria-expanded") === "true";
    $nav.find(".menuItem--toggle").not($btn).each(function() {
      var $other = $(this);
      var $otherSub = $("#" + $other.attr("data-target"));
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
    var $element = $(this);
    var scrollTop = $element.scrollTop();
    var scrollHeight = $element.prop("scrollHeight");
    var clientHeight = $element.prop("clientHeight");
    var isAtTop = scrollTop === 0;
    var isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if (isAtTop && e.originalEvent.deltaY < 0 || isAtBottom && e.originalEvent.deltaY > 0) {
      return;
    }
    e.preventDefault();
    $element.scrollTop(scrollTop + e.originalEvent.deltaY);
  });
});
//# sourceMappingURL=menu-D4_9xxD4.js.map
