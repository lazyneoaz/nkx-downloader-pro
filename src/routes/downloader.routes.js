const express = require('express');
const { handlers, dynamic, PLATFORM_HANDLERS } = require('../controllers/downloader.controller');

const router = express.Router();

// GET /api/download  -> list supported platforms
router.get('/', (req, res) => {
  res.json({
    success: true,
    platforms: Object.keys(PLATFORM_HANDLERS),
    usage: 'GET /api/download/:platform?url=<link>  (e.g. /api/download/tiktok?url=...)',
  });
});

// Dedicated routes: /api/download/tiktok, /api/download/instagram, etc.
router.get('/tiktok', handlers.tiktok);
router.get('/instagram', handlers.instagram);
router.get('/facebook', handlers.facebook);
router.get('/twitter', handlers.twitter);
router.get('/capcut', handlers.capcut);
router.get('/gdrive', handlers.gdrive);
router.get('/mediafire', handlers.mediafire);
router.get('/pinterest', handlers.pinterest);
router.get('/sfilemobi', handlers.sfilemobi);
router.get('/soundcloud', handlers.soundcloud);
router.get('/ytmp3', handlers.ytmp3);
router.get('/ytmp4', handlers.ytmp4);
router.get('/likee', handlers.likee);
router.get('/snackvideo', handlers.snackvideo);
router.get('/aio', handlers.aio);

// Dynamic fallback for any platform key not explicitly listed above:
// GET /api/download/:platform?url=...
router.get('/:platform', dynamic);

module.exports = router;
