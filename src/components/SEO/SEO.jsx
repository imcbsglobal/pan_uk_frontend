import { useEffect } from 'react';

/**
 * SEO Component for managing meta tags, Open Graph, Twitter Cards, and structured data
 * @param {Object} props - SEO configuration
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - SEO keywords (comma-separated)
 * @param {string} props.canonical - Canonical URL
 * @param {string} props.ogTitle - Open Graph title (defaults to title)
 * @param {string} props.ogDescription - Open Graph description (defaults to description)
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: website)
 * @param {string} props.ogUrl - Open Graph URL (defaults to canonical)
 * @param {Object} props.structuredData - JSON-LD structured data
 * @param {string} props.robots - Robots meta tag content
 */
export default function SEO({
  title = 'Pan UK - Best Wedding Store in Kasaragod| Clothing & Accessories',
  description = 'Pan UK - Your trusted fashion destination in Anebagilu, Kasaragod. Shop premium clothing, accessories, footwear, and more. Located at Mall of Kasaragod, Dwarka Road.',
  keywords = 'Pan UK Kasaragod, fashion store Kasaragod, clothing shop Anebagilu, mens fashion Kasaragod, premium clothing Dwarka Road, fashion boutique Kerala, trendy clothes Kasaragod',
  canonical,
  ogTitle,
  ogDescription,
  ogImage = 'https://panukonline.com/panuk-logo.png',
  ogType = 'website',
  ogUrl,
  structuredData,
  robots = 'index, follow',
}) {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector, attribute, content) => {
      if (!content) return;
      
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attr, value] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) || [];
        if (attr && value) {
          element.setAttribute(attr, value);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Update standard meta tags
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="robots"]', 'content', robots);
    
    // Update canonical link
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);
    }

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'content', ogTitle || title);
    updateMetaTag('meta[property="og:description"]', 'content', ogDescription || description);
    updateMetaTag('meta[property="og:image"]', 'content', ogImage);
    updateMetaTag('meta[property="og:type"]', 'content', ogType);
    updateMetaTag('meta[property="og:url"]', 'content', ogUrl || canonical || window.location.href);
    updateMetaTag('meta[property="og:site_name"]', 'content', 'Pan UK');
    updateMetaTag('meta[property="og:locale"]', 'content', 'en_IN');

    // Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'content', ogTitle || title);
    updateMetaTag('meta[name="twitter:description"]', 'content', ogDescription || description);
    updateMetaTag('meta[name="twitter:image"]', 'content', ogImage);

    // Add structured data (JSON-LD)
    if (structuredData) {
      let scriptElement = document.querySelector('script[type="application/ld+json"][data-seo]');
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.type = 'application/ld+json';
        scriptElement.setAttribute('data-seo', 'true');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Optional: Remove structured data on unmount
      const scriptElement = document.querySelector('script[type="application/ld+json"][data-seo]');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogType, ogUrl, structuredData, robots]);

  return null; // This component doesn't render anything
}
