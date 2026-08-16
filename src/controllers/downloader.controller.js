const btch = require('btch-downloader');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Maps a route "platform" segment to the corresponding btch-downloader
 * export. Centralizing this makes it easy to add/remove platforms without
 * touching the route wiring below.
 *
 * If a new version of btch-downloader renames or adds functions, update
 * this map to match — check `node -e "console.log(Object.keys(require('btch-downloader')))"`
 * after installing to see exactly what's available.
 */
const PLATFORM_HANDLERS = {
  tiktok: btch.ttdl,
  instagram: btch.igdl,
  facebook: btch.fbdown,
  twitter: btch.twitter,
  capcut: btch.capcut,
  gdrive: btch.gdrive,
  mediafire: btch.mediafire,
  pinterest: btch.pinterest,
  sfilemobi: btch.sfilemobi,
  soundcloud: btch.soundcloud,
  ytmp3: btch.ytmp3,
  ytmp4: btch.ytmp4,
  likee: btch.likee,
  snackvideo: btch.snackvideo,
  aio: btch.aio,
};

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

    return res.json({
      success: true,
      platform: platformKey,
      data: result,
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

  return res.json({
    success: true,
    platform,
    data: result,
  });
});

module.exports = {
  PLATFORM_HANDLERS,
  handlers,
  dynamic,
};
