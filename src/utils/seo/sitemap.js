/**
 * Sitemap Generator for Pan UK
 * Generates XML sitemap for better SEO
 */

const SITE_URL = 'https://panukonline.com';

/**
 * Generate sitemap.xml content
 * @param {Array} products - Array of product objects
 * @param {Array} categories - Array of category names
 * @returns {string} XML sitemap content
 */
export function generateSitemap(products = [], categories = []) {
  const now = new Date().toISOString();
  
  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
    { url: '/all-products', changefreq: 'daily', priority: '0.9', lastmod: now },
  ];

  // Category pages
  const categoryPages = categories.map(cat => ({
    url: `/category/${slugify(cat)}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: now
  }));

  // Product pages
  const productPages = products.map(product => ({
    url: `/product/${product.id}`,
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: product.updated_at || now
  }));

  const allPages = [...staticPages, ...categoryPages, ...productPages];

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

/**
 * Slugify helper
 */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Example sitemap structure (static for now)
 * In production, this should be generated dynamically from your database
 */
export const STATIC_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://panukonline.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://panukonline.com/all-products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://panukonline.com/category/shirt</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://panukonline.com/category/t-shirt</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://panukonline.com/category/jeans</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://panukonline.com/category/footwear</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
