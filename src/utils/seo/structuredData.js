/**
 * Structured Data (Schema.org) generators for SEO
 */

const SITE_URL = 'https://panukonline.com';
const BUSINESS_NAME = 'Pan UK';
const BUSINESS_ADDRESS = {
  streetAddress: 'Mall Of Kasargod, Anebagilu',
  addressLocality: 'Kasaragod',
  addressRegion: 'Kerala',
  postalCode: '671123',
  addressCountry: 'IN'
};
const BUSINESS_PHONE = '+91 89218 16174';
const BUSINESS_GEO = {
  latitude: '12.4996',
  longitude: '74.9869'
};

/**
 * Local Business Schema - For Homepage
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: BUSINESS_NAME,
    description: 'Premium fashion store offering trendy clothing, accessories, footwear, and more in Kasaragod, Kerala. Your destination for quality fashion.',
    image: `${SITE_URL}/panuk-logo.png`,
    url: SITE_URL,
    telephone: BUSINESS_PHONE,
    address: {
      '@type': 'PostalAddress',
      ...BUSINESS_ADDRESS
    },
    geo: {
      '@type': 'GeoCoordinates',
      ...BUSINESS_GEO
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '09:00',
      closes: '23:30'
    },
    priceRange: '₹₹',
    sameAs: [
      'https://www.instagram.com/pan.uk_/',
      'https://www.justdial.com/Kasaragod/Pan-Uk-Anebagilu-Dwaraka-Road/9999P4994-4994-250410133906-Z4L8_BZDET'
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '150'
    }
  };
}

/**
 * Organization Schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/panuk-logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_PHONE,
      contactType: 'Customer Service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Malayalam']
    },
    address: {
      '@type': 'PostalAddress',
      ...BUSINESS_ADDRESS
    },
    sameAs: [
      'https://www.instagram.com/pan.uk_/',
      'https://www.justdial.com/Kasaragod/Pan-Uk-Anebagilu-Dwaraka-Road/9999P4994-4994-250410133906-Z4L8_BZDET'
    ]
  };
}

/**
 * Product Schema - For Product Detail Pages
 */
export function getProductSchema(product) {
  if (!product) return null;

  const imageUrl = product.images?.[0]?.url || 
                   product.images?.[0]?.image || 
                   product.image || 
                   `${SITE_URL}/panuk-logo.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || 'Product',
    description: product.description || `${product.name} available at Pan UK, Kasaragod`,
    image: imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || BUSINESS_NAME
    },
    offers: {
      '@type': 'Offer',
      price: product.price || '0',
      priceCurrency: 'INR',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_NAME
      }
    },
    category: product.main_category || product.sub_category || 'Fashion',
    sku: product.id || product.sku,
    url: `${SITE_URL}/product/${product.id}`
  };
}

/**
 * Breadcrumb Schema
 */
export function getBreadcrumbSchema(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}

/**
 * Collection/Category Schema
 */
export function getCollectionSchema(categoryName, products = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} - Pan UK Kasaragod`,
    description: `Browse our collection of ${categoryName} at Pan UK, your premium fashion store in Kasaragod, Kerala.`,
    url: `${SITE_URL}/category/${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    isPartOf: {
      '@type': 'WebSite',
      name: BUSINESS_NAME,
      url: SITE_URL
    },
    numberOfItems: products.length
  };
}

/**
 * Website Search Schema
 */
export function getWebsiteSearchSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}
