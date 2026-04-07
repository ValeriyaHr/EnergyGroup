import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UC_im8kPplH1Wx7qJiPpvuWQ';
const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || '@PrimeEnergyGroup-LLC';
const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}`;
const MAX_RESULTS = Number(process.env.YOUTUBE_MAX_RESULTS || 6);
const OUTPUT_PATH = path.resolve(process.cwd(), 'public', 'data', 'youtube-videos.json');

const XML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
};

function decodeEntities(value = '') {
  return String(value).replace(/&(amp|lt|gt|quot|apos|#39);/g, (entity) => XML_ENTITIES[entity] || entity);
}

function stripCdata(value = '') {
  return String(value).replace(/^<!\[CDATA\[|]]>$/g, '');
}

function extractFirstMatch(source, pattern) {
  const match = source.match(pattern);
  return match ? decodeEntities(stripCdata(match[1]).trim()) : '';
}

function formatIsoDuration(isoDuration = '') {
  if (!isoDuration) return '';

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const totalMinutes = hours * 60 + minutes;

  if (hours > 0) {
    return [hours, minutes, seconds].map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0'))).join(':');
  }

  return [totalMinutes, seconds].map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0'))).join(':');
}

async function readExistingSnapshot() {
  if (!existsSync(OUTPUT_PATH)) return null;

  try {
    const raw = await readFile(OUTPUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[youtube-sync] Failed to read existing snapshot:', error.message);
    return null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'PrimeEnergyGroupSite/1.0 (+https://www.youtube.com/@PrimeEnergyGroup-LLC)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'PrimeEnergyGroupSite/1.0 (+https://www.youtube.com/@PrimeEnergyGroup-LLC)',
      Accept: 'application/xml, text/xml, text/plain;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchFromYouTubeApi() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.search = new URLSearchParams({
    part: 'snippet',
    channelId: CHANNEL_ID,
    order: 'date',
    maxResults: String(MAX_RESULTS),
    type: 'video',
    key: apiKey,
  }).toString();

  const searchData = await fetchJson(searchUrl.toString());
  const searchItems = Array.isArray(searchData.items) ? searchData.items : [];
  const videoIds = searchItems
    .map((item) => item?.id?.videoId)
    .filter(Boolean);

  if (!videoIds.length) {
    return {
      source: 'api',
      items: [],
    };
  }

  const durationsById = new Map();
  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videosUrl.search = new URLSearchParams({
    part: 'contentDetails',
    id: videoIds.join(','),
    key: apiKey,
  }).toString();

  const videosData = await fetchJson(videosUrl.toString());
  const videoItems = Array.isArray(videosData.items) ? videosData.items : [];
  videoItems.forEach((item) => {
    const videoId = item?.id;
    const duration = item?.contentDetails?.duration || '';
    if (!videoId) return;
    durationsById.set(videoId, {
      duration,
      formattedDuration: formatIsoDuration(duration),
    });
  });

  return {
    source: 'api',
    items: searchItems.map((item) => {
      const videoId = item?.id?.videoId;
      const snippet = item?.snippet || {};
      const thumbs = snippet?.thumbnails || {};
      const thumb = thumbs.maxres || thumbs.high || thumbs.medium || thumbs.default || {};
      const durationInfo = durationsById.get(videoId) || { duration: '', formattedDuration: '' };

      return {
        id: videoId,
        title: snippet.title || '',
        description: snippet.description || '',
        publishedAt: snippet.publishedAt || '',
        thumbnail: thumb.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        duration: durationInfo.duration,
        formattedDuration: durationInfo.formattedDuration,
      };
    }),
  };
}

async function fetchFromYoutubeRss() {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const xml = await fetchText(rssUrl);
  const entryMatches = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

  const items = entryMatches.slice(0, MAX_RESULTS).map((match) => {
    const block = match[1];
    const videoId = extractFirstMatch(block, /<yt:videoId>([\s\S]*?)<\/yt:videoId>/);
    const title = extractFirstMatch(block, /<title>([\s\S]*?)<\/title>/);
    const publishedAt = extractFirstMatch(block, /<published>([\s\S]*?)<\/published>/);
    const url = extractFirstMatch(block, /<link[^>]+href="([^"]+)"/);
    const thumbnail = extractFirstMatch(block, /<media:thumbnail[^>]+url="([^"]+)"/);
    const description = extractFirstMatch(block, /<media:description>([\s\S]*?)<\/media:description>/);

    return {
      id: videoId,
      title,
      description,
      publishedAt,
      thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: url || `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      duration: '',
      formattedDuration: '',
    };
  }).filter((item) => item.id && item.title);

  return {
    source: 'rss',
    items,
  };
}

async function writeSnapshot(payload) {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  const existingSnapshot = await readExistingSnapshot();
  let result = null;
  let sourceUsed = '';

  try {
    result = await fetchFromYouTubeApi();
    if (result?.items?.length) {
      sourceUsed = 'api';
    }
  } catch (error) {
    console.warn('[youtube-sync] API fetch failed:', error.message);
  }

  if (!result?.items?.length) {
    try {
      result = await fetchFromYoutubeRss();
      if (result?.items?.length) {
        sourceUsed = result.source;
      }
    } catch (error) {
      console.warn('[youtube-sync] RSS fetch failed:', error.message);
    }
  }

  if (!result?.items?.length) {
    if (existingSnapshot?.items?.length) {
      console.warn('[youtube-sync] Using existing cached snapshot.');
      return;
    }

    throw new Error('Failed to fetch YouTube videos from both API and RSS.');
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: sourceUsed || result?.source || 'unknown',
    channel: {
      id: CHANNEL_ID,
      handle: CHANNEL_HANDLE,
      url: CHANNEL_URL,
    },
    items: result.items.slice(0, MAX_RESULTS),
  };

  await writeSnapshot(snapshot);
  console.log(`[youtube-sync] Saved ${snapshot.items.length} videos to ${OUTPUT_PATH} via ${snapshot.source}.`);
}

main().catch((error) => {
  console.error('[youtube-sync] Fatal:', error.message);
  process.exitCode = 1;
});

