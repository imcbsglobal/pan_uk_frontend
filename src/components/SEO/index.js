// SEO Components Export Index
export { default as SEO } from './SEO';

// Re-export structured data generators
export {
  getLocalBusinessSchema,
  getOrganizationSchema,
  getProductSchema,
  getBreadcrumbSchema,
  getCollectionSchema,
  getWebsiteSearchSchema
} from '../../utils/seo/structuredData';

// Re-export keywords and content
export {
  PRIMARY_KEYWORDS,
  SECONDARY_KEYWORDS,
  CATEGORY_KEYWORDS,
  LOCATION_KEYWORDS,
  BUSINESS_INFO,
  CONTENT_SNIPPETS,
  META_DESCRIPTIONS,
  ALT_TEXT_TEMPLATES
} from '../../utils/seo/keywords';
