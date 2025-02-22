module.exports = function imageLoader({ src, width, quality }) {
  return `https://avatars.githubusercontent.com/${src}?w=${width}&q=${quality || 75}`;
}; 