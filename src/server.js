// Local development entry point.
// On Vercel, api/index.js is used instead — Vercel manages the listener itself.
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API server running locally at http://localhost:${PORT}`);
});
