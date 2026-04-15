const createFallbackSvg = (width = 600, height = 400, label = 'Image unavailable') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#f3f3f3"/>
      <rect x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.15)}" width="${Math.round(width * 0.8)}" height="${Math.round(height * 0.7)}" rx="16" fill="#ffffff" stroke="#d5d9d9"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#565959" font-family="Arial" font-size="${Math.max(12, Math.round(width / 24))}">${label}</text>
    </svg>
  `);

export const IMAGE_FALLBACK = createFallbackSvg();

export const getSizedFallback = (width, height, label) => createFallbackSvg(width, height, label);

export const getPlaceholderImage = (productName = 'Product', width = 400, height = 400) => {
  // Use placeholder service for more realistic fallback
  const encoded = encodeURIComponent(productName.slice(0, 20));
  return `https://via.placeholder.com/${width}x${height}?text=${encoded}`;
};

export const normalizeImageUrl = (rawUrl, fallback = IMAGE_FALLBACK) => {
  if (!rawUrl) return fallback;

  const url = String(rawUrl).trim();
  if (!url) return fallback;

  if (url.startsWith('data:')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Keep absolute and relative app paths working when image URLs are local.
  if (url.startsWith('/')) return url;
  if (/^[A-Za-z0-9._/-]+\.(png|jpe?g|webp|gif|svg)$/i.test(url)) {
    return `/${url.replace(/^\/+/, '')}`;
  }

  return fallback;
};

export const withImageFallback = (event, fallback = IMAGE_FALLBACK) => {
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
};
