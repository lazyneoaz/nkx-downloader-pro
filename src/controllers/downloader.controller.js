const btch = require('btch-downloader');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Maps a route "platform" segment to the corresponding btch-downloader
 * export. This must match the package's actual exports — verify with:
 *   node -e "console.log(Object.keys(require('btch-downloader')))"
 * after `npm install`, since third-party scraper packages like this one
 * rename/add/drop platform functions between versions without much notice.
 *
 * Current (as of writing) btch-downloader exports 17 functions:
 *   Social:  igdl, ttdl, fbdown, twitter, douyin, xiaohongshu, snackvideo, cocofun
 *   Video:   youtube, capcut, pinterest, aio
 *   Audio:   spotify, soundcloud, yts (yts = search, not a downloader)
 *   Storage: mediafire, gdrive
 *
 * Note: there is no dedicated ytmp3/ytmp4 — YouTube downloads go through
 * `youtube(url)`. `yts` is a *search* function that overlaps with our
 * yt-search-based /api/search/youtube route, so it's intentionally left
 * out of the download map below.
 */
const PLATFORM_HANDLERS = {
  tiktok: btch.ttdl,
  instagram: btch.igdl,
  facebook: btch.fbdown,
  twitter: btch.twitter,
  douyin: btch.douyin,
  xiaohongshu: btch.xiaohongshu,
  snackvideo: btch.snackvideo,
  cocofun: btch.cocofun,
  youtube: btch.youtube,
  capcut: btch.capcut,
  pinterest: btch.pinterest,
  spotify: btch.spotify,
  soundcloud: btch.soundcloud,
  mediafire: btch.mediafire,
  gdrive: btch.gdrive,
  aio: btch.aio,
};

/**
 * btch-downloader is a thin client that forwards every call to a remote
 * backend service (it does not scrape locally). That means a "successful"
 * promise resolution can still carry a failure inside the payload, e.g.
 * { status: false, error: "Invalid search API response" }. We treat that
 * as a failed request rather than silently reporting success: true.
 */
function normalize(result) {
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    const failed = result.status === false || typeof result.error === 'string';
    return { failed, payload: result };
  }
  // Arrays (e.g. igdl carousel results) or primitives are treated as success.
  return { failed: false, payload: result };
}

/**
 * Generic handler factory: GET /api/download/:platform?url=<link>
 * Also exposed as dedicated routes (e.g. GET /api/download/tiktok?url=...)
 * for clearer, more discoverable endpoints.
 */
function makeHandler(platformKey) {
  const fn = PLATFORM_HANDLERS[platformKey];

  return asyncHandler(async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "url" is required.',
      });
    }

    if (typeof fn !== 'function') {
      return res.status(501).json({
        success: false,
        message: `"${platformKey}" is not available in the installed version of btch-downloader.`,
      });
    }

    const result = await fn(url);
    const { failed, payload } = normalize(result);

    if (failed) {
      // The remote backend reached us fine but reported it couldn't fulfil
      // the request — most often an unsupported/malformed URL, the media
      // being private/deleted, or the backend having a transient issue.
      return res.status(502).json({
        success: false,
        platform: platformKey,
        message: 'The download backend rejected or failed this request.',
        upstream: payload,
      });
    }

    return res.json({
      success: true,
      platform: platformKey,
      data: payload,
    });
  });
}

// One handler per supported platform
const handlers = Object.fromEntries(
  Object.keys(PLATFORM_HANDLERS).map((key) => [key, makeHandler(key)])
);

// Dynamic fallback: GET /api/download/:platform?url=...
const dynamic = asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "url" is required.',
    });
  }

  const fn = PLATFORM_HANDLERS[platform];

  if (typeof fn !== 'function') {
    return res.status(404).json({
      success: false,
      message: `Unsupported platform "${platform}". Supported platforms: ${Object.keys(
        PLATFORM_HANDLERS
      ).join(', ')}`,
    });
  }

  const result = await fn(url);
  const { failed, payload } = normalize(result);

  if (failed) {
    return res.status(502).json({
      success: false,
      platform,
      message: 'The download backend rejected or failed this request.',
      upstream: payload,
    });
  }

  return res.json({
    success: true,
    platform,
    data: payload,
  });
});

module.exports = {
  PLATFORM_HANDLERS,
  handlers,
  dynamic,
};
