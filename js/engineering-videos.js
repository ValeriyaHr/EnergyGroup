const DEFAULT_DATA_URL = '/data/youtube-videos.json';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createPlayIconSvg() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="31" fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.18)" />
      <path d="M26 20.5L46 32L26 43.5V20.5Z" fill="#fff" />
    </svg>
  `;
}

function buildCardMarkup(video, locale) {
  const durationBadge = video.formattedDuration
    ? `<span class="engChannelVideoCard__duration">${escapeHtml(video.formattedDuration)}</span>`
    : '';

  return `
    <button class="engChannelVideoCard" type="button" data-video-id="${escapeHtml(video.id)}" aria-label="${escapeHtml(`${locale.playLabel}: ${video.title}`)}">
      <span class="engChannelVideoCard__media">
        <img
          class="engChannelVideoCard__thumb"
          src="${escapeHtml(video.thumbnail)}"
          alt="${escapeHtml(video.title)}"
          loading="lazy"
          decoding="async"
        />
        <span class="engChannelVideoCard__overlay"></span>
        <span class="engChannelVideoCard__play">${createPlayIconSvg()}</span>
        ${durationBadge}
      </span>
      <span class="engChannelVideoCard__body">
        <span class="engChannelVideoCard__title">${escapeHtml(video.title)}</span>
      </span>
    </button>
  `;
}

function getLocaleConfig(root) {
  return {
    loadingText: root.dataset.loadingText || 'Завантажуємо відео…',
    errorText: root.dataset.errorText || 'Не вдалося завантажити відео.',
    emptyText: root.dataset.emptyText || 'Наразі відео недоступні.',
    playLabel: root.dataset.playLabel || 'Відкрити відео',
    navPrevLabel: root.dataset.navPrevLabel || 'Попередні відео',
    navNextLabel: root.dataset.navNextLabel || 'Наступні відео',
    featuredLabel: root.dataset.featuredLabel || 'Обране відео',
  };
}

async function fetchVideos(dataUrl) {
  const response = await fetch(dataUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

function renderStatus(statusNode, text, isError = false) {
  if (!statusNode) return;
  statusNode.hidden = false;
  statusNode.textContent = text;
  statusNode.classList.toggle('is-error', isError);
}

function getFeaturedNodes() {
  const section = document.querySelector('[data-youtube-featured]');
  if (!section) return null;

  return {
    section,
    card: section.querySelector('[data-youtube-featured-card]'),
    status: section.querySelector('[data-youtube-featured-status]'),
    title: section.querySelector('[data-youtube-featured-title]'),
  };
}

function renderFeaturedVideo(featured, video, locale, autoplay = false) {
  if (!featured?.card) return;

  const autoplayQuery = autoplay ? '1' : '0';
  const joinChar = video.embedUrl.includes('?') ? '&' : '?';
  featured.card.innerHTML = `
    <iframe
      src="${escapeHtml(`${video.embedUrl}${joinChar}autoplay=${autoplayQuery}&rel=0`)}"
      title="${escapeHtml(video.title)}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
  `;

  if (featured.status) featured.status.hidden = true;
  featured.card.setAttribute('data-has-video', '');
  if (featured.title) featured.title.textContent = `${locale.featuredLabel}: ${video.title}`;
}

function setupSliderNavigation(root, locale) {
  const grid = root.querySelector('[data-youtube-grid]');
  const prevButton = root.querySelector('[data-youtube-nav-prev]');
  const nextButton = root.querySelector('[data-youtube-nav-next]');
  if (!grid || !prevButton || !nextButton) return;

  prevButton.setAttribute('aria-label', locale.navPrevLabel);
  nextButton.setAttribute('aria-label', locale.navNextLabel);

  const getScrollStep = () => {
    const card = grid.querySelector('.engChannelVideoCard');
    if (!card) return grid.clientWidth;

    const styles = window.getComputedStyle(grid);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const updateButtonsState = () => {
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const atStart = grid.scrollLeft <= 2;
    const atEnd = grid.scrollLeft >= maxScroll - 2;

    prevButton.disabled = atStart;
    nextButton.disabled = atEnd;
  };

  prevButton.addEventListener('click', () => {
    grid.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    grid.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
  });

  grid.addEventListener('scroll', updateButtonsState, { passive: true });
  window.addEventListener('resize', updateButtonsState);
  updateButtonsState();
}

function renderGrid(root, videos, locale) {
  const grid = root.querySelector('[data-youtube-grid]');
  const slider = root.querySelector('[data-youtube-slider]');
  const status = root.querySelector('[data-youtube-status]');
  const featured = getFeaturedNodes();
  if (!grid) return;

  grid.innerHTML = videos.map((video) => buildCardMarkup(video, locale)).join('');
  if (slider) {
    slider.hidden = false;
  }
  if (status) status.hidden = true;

  setupSliderNavigation(root, locale);
  if (featured && videos[0]) {
    renderFeaturedVideo(featured, videos[0], locale, false);
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('.engChannelVideoCard');
    if (!button) return;

    const videoId = button.dataset.videoId;
    const video = videos.find((item) => item.id === videoId);
    if (!video) return;

    if (featured) {
      renderFeaturedVideo(featured, video, locale, true);
      featured.section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

async function initYoutubeFeed(root) {
  const locale = getLocaleConfig(root);
  const dataUrl = root.dataset.source || DEFAULT_DATA_URL;
  const limit = Math.max(1, Number(root.dataset.maxResults || 6));
  const status = root.querySelector('[data-youtube-status]');

  renderStatus(status, locale.loadingText, false);

  try {
    const videos = await fetchVideos(dataUrl);
    if (!videos.length) {
      renderStatus(status, locale.emptyText, false);
      return;
    }

    renderGrid(root, videos.slice(0, limit), locale);
  } catch (error) {
    console.error('[engineering-videos] Failed to render YouTube feed:', error);
    renderStatus(status, locale.errorText, true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const feeds = document.querySelectorAll('[data-youtube-feed]');
  feeds.forEach((root) => initYoutubeFeed(root));
});

