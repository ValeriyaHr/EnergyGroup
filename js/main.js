import "./jquery-global.js";

// import $ from "jquery";
// window.$ = $;
// window.jQuery = $;

const $ = window.jQuery;


//import "./menu.js";



function isMobileView() {
    return window.matchMedia('(max-width: 768px)').matches;
}
// Вызов setupCounter — только если функция определена (защита от Vite шаблонных артефактов)
const counterEl = document.querySelector('#counter');
if (counterEl && typeof window.setupCounter === 'function') {
    window.setupCounter(counterEl);
}

document.addEventListener("DOMContentLoaded", () => {
    initWhyUsUnfold();
    if (typeof initSmoothAnchorScroll === "function") initSmoothAnchorScroll();
    initExperienceNumbers();
    initExperienceAnimation();
});


// --- arrows as DATA URI (exactly your white-up2.svg & orange-up2.svg) ---
const WHITE_ARROW =
    "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";

const ORANGE_ARROW =
    "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20fill%3D%22%23f80%22%20d%3D%22M17.98%2C6.06%2C17.98%2C4.02%2C15.94%2C4.02%2C15.94%2C4.04%2C5.02%2C4.04%2C5.02%2C6.06%2C14.48%2C6.06%2C4.02%2C16.52%2C5.48%2C17.98%2C15.94%2C7.52%2C15.94%2C17.98%2C17.98%2C17.98%2C17.98%2C6.06Z%22/%3E%3C/svg%3E";

// ставимо білі стрілки одразу (щоб не було src="")
document.querySelectorAll(".engRow__arrowIcon").forEach((img) => {
    img.src = WHITE_ARROW;
});

// акордеон — клік по всьому блоку
document.addEventListener("click", (e) => {
    const row = e.target.closest(".js-engRow");
    if (!row) return;

    const panel = row.nextElementSibling?.classList.contains("js-engPanel")
        ? row.nextElementSibling
        : null;

    if (!panel) return;

    const icon = row.querySelector(".engRow__arrowIcon");
    const engineeringSection = row.closest("section#engineering.engineering");

    const closeRow = (rowToClose) => {
        const panelToClose = rowToClose.nextElementSibling?.classList.contains("js-engPanel")
            ? rowToClose.nextElementSibling
            : null;
        const iconToClose = rowToClose.querySelector(".engRow__arrowIcon");
        const itemToClose = rowToClose.closest(".engItem");

        rowToClose.classList.remove("is-open");
        rowToClose.setAttribute("aria-expanded", "false");
        if (iconToClose) iconToClose.src = WHITE_ARROW;
        if (itemToClose) itemToClose.classList.remove("is-open");
        if (panelToClose) {
            panelToClose.hidden = true;
            panelToClose.classList.remove("is-open");
        }
    };

    const isOpen = row.classList.toggle("is-open");
    row.setAttribute("aria-expanded", String(isOpen));

    if (engineeringSection && isOpen) {
        engineeringSection.querySelectorAll(".js-engRow.is-open").forEach((openRow) => {
            if (openRow !== row) closeRow(openRow);
        });
    }

    if (icon) icon.src = isOpen ? ORANGE_ARROW : WHITE_ARROW;

    const item = row.closest(".engItem");
    if (item) item.classList.toggle("is-open", isOpen);

    panel.hidden = !isOpen;
    panel.classList.toggle("is-open", isOpen);
});


/// ./js/main.js
// Prime Energy Group — main interactions (vanilla JS)

function initWhyUsUnfold() {
    const root = document.querySelector("#whyReveal");
    if (!root) return;

    const items = root.querySelectorAll(".whyItem");
    if (!items.length) return;

    // щоб CSS міг порахувати висоту панелі
    root.style.setProperty("--count", String(items.length));

    // reduced motion — одразу розкладено
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
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
        const mobileView = isMobileView();

        // довгий “інтервал” розгортання — щоб виглядало як у макеті
        const start = vh * (mobileView ? 1.2 : 0.95); // на мобільній починаємо пізніше
        const end   = vh * (mobileView ? 0.2 : 0.05); // і довше тримаємо стек

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

// головна цифри

function initExperienceStack() {
    const stage = document.querySelector(".experience");
    if (!stage) return;

    const nums = stage.querySelector(".experience__numbers");
    if (!nums) return;

    const items = Array.from(nums.querySelectorAll(".experience__big"));
    if (!items.length) return;

    // reduced motion: одразу фінал
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        items.forEach((el) => el.style.setProperty("--t", "1"));
        return;
    }

    let raf = 0;
    let active = false;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const update = () => {
        raf = 0;
        if (!active) return;

        const r = stage.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;

        // довший інтервал, щоб "по одному" виглядало плавно
        const start = vh * 0.92;   // старт трохи раніше
        const end   = -vh * 0.50;  // фініш ближче, щоб швидше складався стек

        const p01 = clamp01((start - r.top) / (start - end));

        // 0..N: по черзі для кожного елемента
        const n = items.length;
        const p = p01 * (n - 1);

        items.forEach((el, i) => {
            const t = clamp01(p - i);
            el.style.setProperty("--t", t.toFixed(4));
        });
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

    io.observe(stage);
}

function initExperienceNumbers() {
    return;
    const section = document.querySelector(".experience");
    if (!section) return;

    const nums = section.querySelector(".experience__numbers");
    if (!nums) return;

    const items = Array.from(nums.querySelectorAll(".experience__big"));
    if (!items.length) return;

    // reduce motion => одразу фінал
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        items.forEach((el) => el.style.setProperty("--t", "1"));
        return;
    }

    let raf = 0;
    let active = false;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const update = () => {
        raf = 0;
        if (!active) return;

        const r = section.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;

        // прогрес секції (довгий, щоб “по одній” було красиво)
        const start = vh * 0.75;
        const end = -vh * 1.10;
        const p01 = clamp01((start - r.top) / (start - end));

        // розкладаємо на N цифр
        const n = items.length;
        const p = p01 * (n - 1);

        items.forEach((el, i) => {
            const t = clamp01(p - i);
            el.style.setProperty("--t", t.toFixed(4));
        });
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
        { rootMargin: "300px 0px 300px 0px", threshold: 0.01 }
    );

    io.observe(section);
}

/* ===== EXPERIENCE SECTION ANIMATION ===== */
function initExperienceAnimation() {
  const experienceSection = document.querySelector('.experience');
  const expGrid = document.querySelector('.expGrid');
  
  if (!experienceSection || !expGrid) return;
  
  // Получаем все expRow
  const expRows = expGrid.querySelectorAll('.expRow');
  if (!expRows.length) return;
  
  let hasAnimated = false;
  
  // Создаём IntersectionObserver для триггера анимации
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Триггер только когда секция входит в viewport и ще не анимирована
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
  // Извлекаем число из строки (например, "15 000+" -> 15000)
  const match = str.match(/[\d\s]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/\s/g, ''), 10);
}

function animateCounter(element, finalValue, duration = 1800) {
  const startValue = 0;
  const startTime = Date.now();
  
  // Сохраняем оригинальный текст (для суффиксов типа "+")
  const originalText = element.textContent;
  const suffix = originalText.replace(/[\d\s]/g, '');
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function для плавной анимации
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOut);
    
    // Форматируем число с пробелами (15000 -> "15 000")
    const formattedValue = currentValue.toLocaleString('uk-UA').replace(/\s/g, ' ');
    element.textContent = formattedValue + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}

function animateSingleRow(row) {
  return new Promise((resolve) => {
    row.classList.add('is-active');
    
    // Получаем expNum внутри этой строки
    const expNum = row.querySelector('.expNum');
    if (expNum) {
      // Добавляем класс для жёлтого цвета
      expNum.classList.add('is-highlight');
      
      // Парсим финальное число
      const finalValue = parseNumber(expNum.textContent);
      
      // Запускаем counter-анимацию (1800ms)
      if (finalValue > 0) {
        animateCounter(expNum, finalValue, 1800);
      }
      
      // Через 1900ms (после завершения счёта) меняем цвет обратно
      setTimeout(() => {
        expNum.classList.remove('is-highlight');
      }, 1900);
    }
    
    // Разрешаем Promise через 2000ms (чтобы гарантировать завершение анимации)
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

async function animateExperienceRowsSequential(expRows) {
  // Анимируем каждый row последовательно, один за другим
  for (let i = 0; i < expRows.length; i++) {
    await animateSingleRow(expRows[i]);
  }
}

/* ===== EXPERIENCE MOBILE SECTION ANIMATION ===== */
function initExperienceMobileAnimation() {
  const experienceSection = document.querySelector('.experience');
  const experienceStats = document.querySelector('.experienceStats');
  
  if (!experienceSection || !experienceStats) return;
  
  // Получаем все experienceStat
  const experienceStatItems = experienceStats.querySelectorAll('.experienceStat');
  if (!experienceStatItems.length) return;
  
  let hasAnimated = false;
  
  // Создаём IntersectionObserver для триггера анимации
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Триггер только когда секция входит в viewport и ще не анимирована
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
    stat.classList.add('is-active');
    
    // Получаем experience__big внутри этой строки
    const expBig = stat.querySelector('.experience__big');
    if (expBig) {
      // Добавляем класс для жёлтого цвета
      expBig.classList.add('is-highlight');
      
      // Парсим финальное число
      const finalValue = parseNumber(expBig.textContent);
      
      // Запускаем counter-анимацию (1800ms)
      if (finalValue > 0) {
        animateCounter(expBig, finalValue, 1800);
      }
      
      // Через 1900ms (после завершения счёта) меняем цвет обратно
      setTimeout(() => {
        expBig.classList.remove('is-highlight');
      }, 1900);
    }
    
    // Разрешаем Promise через 2000ms (чтобы гарантировать завершение анимации)
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

async function animateMobileExperienceRowsSequential(experienceStatItems) {
  // Анимируем каждый stat последовательно, один за другим
  for (let i = 0; i < experienceStatItems.length; i++) {
    await animateSingleMobileRow(experienceStatItems[i]);
  }
}

// Инициализируем мобильную анимацию
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, есть ли мобильная версия
  if (document.querySelector('.experienceStats')) {
      if (isMobileView()){
          initExperienceMobileAnimation();
      }
  }
  
  // Инициализируем анимацию tics
  initTicsAnimation();
});

/* ===== TICS ANIMATION ===== */
function initTicsAnimation() {
  const section = document.querySelector('.engSection');
  const card = section?.querySelector('.engSection__card');
  const ticsElement = document.querySelector('.engSection__ticks');
  const secondRow = section?.querySelectorAll('.engSolRow')?.[1];

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
    ticsElement.style.setProperty('--eng-ticks-scroll-rotate', '0deg');
    ticsElement.style.setProperty('--eng-ticks-scroll-shift-y', '0px');
    ticsElement.style.setProperty('--eng-ticks-scroll-scale', '1');
  }

  // Стартуем из нейтрального состояния.
  setNeutralState();

  function updateTicsPlacement() {
    const mobileView = isMobileView();
    const target = mobileView
      ? secondRow.querySelector('.engSolRow__num')
      : secondRow.querySelector('.engSolRow__center');

    if (!target) return;

    const cardRect = card.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const baseCenterX = targetRect.left - cardRect.left + (targetRect.width / 2);
    const baseCenterY = targetRect.top - cardRect.top + (targetRect.height / 2);
    const centerX = mobileView ? baseCenterX - (targetRect.width * 0.52) : baseCenterX;
    const centerY = mobileView ? baseCenterY - (targetRect.height * 0.14) : baseCenterY;
    const baseSize = Math.max(targetRect.width, targetRect.height);
    const size = mobileView
      ? Math.max(targetRect.height * 2.85, 320)
      : Math.max(baseSize * 2.15, 920);

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

    // Вниз (delta > 0) -> по часовой (+угол), вверх -> против часовой (-угол).
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

    // Мягкое затухание цели в ноль, чтобы после остановки скролла без рывка вернуться в нейтраль.
    targetRotation *= 0.92;
    if (Math.abs(targetRotation) < 0.08) targetRotation = 0;
    if (Math.abs(currentRotation) < 0.06 && targetRotation === 0) currentRotation = 0;

    ticsElement.style.setProperty('--eng-ticks-scroll-rotate', `${currentRotation.toFixed(2)}deg`);
    ticsElement.style.setProperty('--eng-ticks-scroll-shift-y', '0px');
    ticsElement.style.setProperty('--eng-ticks-scroll-scale', '1');

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

  window.addEventListener('resize', () => {
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
        window.addEventListener('scroll', requestTickUpdate, { passive: true });
      } else if (!visible && inView) {
        inView = false;
        window.removeEventListener('scroll', requestTickUpdate);
        if (animationRaf) {
          window.cancelAnimationFrame(animationRaf);
          animationRaf = 0;
        }
        currentRotation = 0;
        targetRotation = 0;
        setNeutralState();
      }
    },
    { rootMargin: '200px 0px 200px 0px', threshold: 0.01 }
  );

  observer.observe(section);
}
