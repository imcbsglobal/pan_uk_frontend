/**
 * SEO Keywords and Content for Pan UK
 * Local SEO focus: Kasaragod, Anebagilu, Dwarka Road, Kerala
 */

// Primary Keywords
export const PRIMARY_KEYWORDS = [
  'Pan UK Kasaragod',
  'fashion store Kasaragod',
  'clothing shop Anebagilu',
  'premium fashion Dwarka Road',
  'trendy clothes Kasaragod'
];

// Secondary Keywords
export const SECONDARY_KEYWORDS = [
  'mens fashion Kasaragod',
  'womens clothing Kasaragod',
  'fashion boutique Kerala',
  'branded clothes Kasaragod',
  'footwear store Anebagilu',
  'accessories shop Kasaragod',
  'Mall of Kasaragod fashion',
  'best clothing store Kasaragod',
  'trendy fashion Dwarka Road',
  'imported clothes Kasaragod'
];

// Category-specific Keywords
export const CATEGORY_KEYWORDS = {
  'Shirt': 'premium shirts Kasaragod, mens shirts Anebagilu, formal shirts Kerala',
  'T-Shirt': 't-shirts Kasaragod, casual tees Anebagilu, branded t-shirts Kerala',
  'Jeans': 'jeans Kasaragod, denim pants Anebagilu, mens jeans Dwarka Road',
  'Cotton Pant': 'cotton pants Kasaragod, formal pants Anebagilu, trousers Kerala',
  'Footwear': 'footwear Kasaragod, shoes Anebagilu, sandals Dwarka Road Kerala',
  'Co-ords': 'co-ord sets Kasaragod, matching outfits Anebagilu, fashion sets Kerala',
  'Watches': 'watches Kasaragod, timepieces Anebagilu, branded watches Kerala',
  'Track': 'tracksuits Kasaragod, sportswear Anebagilu, athleisure Kerala',
  'Caps': 'caps Kasaragod, hats Anebagilu, fashion accessories Kerala',
  'Jewellery': 'jewellery Kasaragod, fashion accessories Anebagilu, ornaments Kerala',
  'Sunglasses': 'sunglasses Kasaragod, eyewear Anebagilu, fashion glasses Kerala',
  'Wallets': 'wallets Kasaragod, leather wallets Anebagilu, accessories Kerala',
  'Combo set': 'combo sets Kasaragod, outfit bundles Anebagilu, value packs Kerala',
  'Pants': 'pants Kasaragod, trousers Anebagilu, formal wear Kerala',
  'Shorts': 'shorts Kasaragod, casual shorts Anebagilu, summer wear Kerala',
  'Belt': 'belts Kasaragod, leather belts Anebagilu, fashion accessories Kerala',
  'Suit': 'suits Kasaragod, formal suits Anebagilu, business wear Kerala',
  'Sherwani': 'sherwani Kasaragod, ethnic wear Anebagilu, traditional clothing Kerala',
  'Jodhpuri': 'jodhpuri suits Kasaragod, ethnic suits Anebagilu, traditional wear Kerala',
  'Kurthas': 'kurthas Kasaragod, ethnic kurtas Anebagilu, traditional fashion Kerala',
  'Dress code': 'dress code outfits Kasaragod, formal wear Anebagilu, business attire Kerala',
  'Jacket': 'jackets Kasaragod, winter wear Anebagilu, outerwear Kerala',
  'Perfume': 'perfumes Kasaragod, fragrances Anebagilu, designer scents Kerala',
  'Lotion': 'lotions Kasaragod, body care Anebagilu, skincare Kerala',
  'kids&boys': 'kids fashion Kasaragod, boys clothing Anebagilu, childrens wear Kerala'
};

// Location-based Keywords
export const LOCATION_KEYWORDS = {
  city: 'Kasaragod',
  area: 'Anebagilu',
  landmark: 'Mall of Kasaragod',
  road: 'Dwarka Road',
  state: 'Kerala',
  pincode: '671123'
};

// Business Information for Content
export const BUSINESS_INFO = {
  name: 'Pan UK',
  tagline: 'Your Premium Fashion Destination in Kasaragod',
  description: 'Pan UK is Kasaragod\'s premier fashion destination, located at Mall of Kasaragod, Anebagilu, Dwarka Road. We offer an extensive collection of trendy and premium clothing, accessories, footwear, and imported fashion items for men, women, and children.',
  address: 'Mall Of Kasargod, Anebagilu, MG Road, Dwarka Road, Kasaragod - 671123, Kerala',
  phone: '+91 89218 16174',
  instagram: '@pan.uk_',
  hours: 'Open until 11:30 PM',
  features: [
    'Premium imported clothing collection',
    'Trendy fashion for all ages',
    'Quality accessories and footwear',
    'Branded watches and jewellery',
    'Ethnic and formal wear',
    'Latest fashion trends',
    'Competitive pricing',
    'Convenient location at Mall of Kasaragod'
  ]
};

// SEO-optimized Content Snippets
export const CONTENT_SNIPPETS = {
  homepage: {
    h1: 'Pan UK - Premium Fashion Store in Kasaragod, Kerala',
    subtitle: 'Discover Trending Fashion Collections at Mall of Kasaragod, Anebagilu',
    description: 'Shop the latest fashion trends at Pan UK, your trusted clothing destination in Kasaragod. Located at Mall of Kasaragod, Dwarka Road, Anebagilu. Premium clothing, accessories, footwear, and imported fashion items.'
  },
  about: {
    h1: 'About Pan UK - Kasaragod\'s Favorite Fashion Destination',
    description: 'Established in the heart of Kasaragod at Anebagilu, Dwarka Road, Pan UK has become the go-to fashion store for quality clothing and accessories. We pride ourselves on offering premium imported and local fashion collections.'
  },
  categories: {
    h1: 'Browse Fashion Categories',
    description: 'Explore our wide range of fashion categories including shirts, t-shirts, jeans, ethnic wear, footwear, accessories, and more at Pan UK, Kasaragod.'
  }
};

// Meta Descriptions for Different Pages
export const META_DESCRIPTIONS = {
  home: 'Pan UK - Your premium fashion destination in Kasaragod, Kerala. Shop trendy clothing, accessories, footwear & imported fashion at Mall of Kasaragod, Anebagilu, Dwarka Road. Open till 11:30 PM.',
  products: 'Browse premium clothing and fashion products at Pan UK, Kasaragod. Quality shirts, jeans, ethnic wear, accessories, and footwear. Located at Anebagilu, Dwarka Road.',
  category: (category) => `Shop ${category} at Pan UK, Kasaragod's leading fashion store. Premium quality ${category.toLowerCase()} available at Mall of Kasaragod, Anebagilu, Dwarka Road, Kerala.`,
  product: (productName) => `${productName} - Available at Pan UK, Kasaragod. Premium fashion store offering quality clothing and accessories at Mall of Kasaragod, Dwarka Road, Anebagilu.`
};

// Alt Text Templates
export const ALT_TEXT_TEMPLATES = {
  logo: 'Pan UK - Premium Fashion Store in Kasaragod, Kerala',
  categoryImage: (category) => `${category} collection at Pan UK, premium fashion store in Kasaragod, Anebagilu`,
  productImage: (productName, index) => `${productName} - Pan UK Kasaragod fashion store - Image ${index + 1}`,
  banner: 'Pan UK fashion store - Trendy clothing collection in Kasaragod, Mall of Kasaragod, Dwarka Road',
  imported: 'Exclusive imported fashion collection at Pan UK, Kasaragod - Premium quality clothing and accessories'
};
