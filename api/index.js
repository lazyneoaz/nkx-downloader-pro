// Vercel serverless entry point.
// Vercel wraps this exported Express app as a single serverless function,
// and vercel.json routes all incoming requests to this file.
const app = require('../src/app');

module.exports = app;
