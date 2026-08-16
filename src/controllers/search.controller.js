const yts = require('yt-search');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/search/youtube?q=<query>&limit=10
const searchYoutube = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "q" is required.',
    });
  }

  const results = await yts(q);
  const max = Math.min(Number(limit) || 20, 50);

  const videos = results.videos.slice(0, max).map((v) => ({
    videoId: v.videoId,
    title: v.title,
    url: v.url,
    duration: v.duration,
    timestamp: v.timestamp,
    views: v.views,
    author: v.author?.name,
    thumbnail: v.thumbnail,
    ago: v.ago,
    description: v.description,
  }));

  return res.json({
    success: true,
    query: q,
    count: videos.length,
    results: videos,
  });
});

// GET /api/search/youtube/video/:videoId
const getYoutubeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: 'Route parameter "videoId" is required.',
    });
  }

  const info = await yts({ videoId });

  return res.json({
    success: true,
    data: info,
  });
});

module.exports = {
  searchYoutube,
  getYoutubeVideo,
};
