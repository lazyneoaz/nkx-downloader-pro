const express = require('express');
const { searchYoutube, getYoutubeVideo } = require('../controllers/search.controller');

const router = express.Router();

// GET /api/search/youtube?q=<query>&limit=10
router.get('/youtube', searchYoutube);

// GET /api/search/youtube/video/:videoId
router.get('/youtube/video/:videoId', getYoutubeVideo);

module.exports = router;
