# Pan UK - E-commerce Website

Premium fashion store website for Pan UK, located in Kasaragod, Kerala. Built with React, Vite, and comprehensive SEO optimization.

## 🏢 Business Information

**Pan UK** - Your Premium Fashion Destination  
📍 Mall Of Kasargod, Anebagilu, MG Road, Dwarka Road, Kasaragod - 671123, Kerala  
📞 +91 89218 16174  
🌐 https://panukonline.com  
📱 Instagram: [@pan.uk_](https://www.instagram.com/pan.uk_/)

## 🚀 Features

### Core Features
- 🛍️ Product catalog with categories
- 🔍 Category-based browsing
- 📱 Fully responsive design
- 🛒 Shopping cart functionality
- 👤 User authentication
- 🎨 Modern, clean UI/UX

### SEO Features ✨ (NEW)
- 🎯 **Local SEO Optimization** - Targeted for Kasaragod, Kerala
- 📊 **Schema.org Markup** - LocalBusiness, Product, Breadcrumb schemas
- 🏷️ **Dynamic Meta Tags** - Unique titles and descriptions per page
- 🖼️ **Image SEO** - Descriptive, keyword-rich alt text
- 🗺️ **Rich Snippets** - Enhanced search result display
- 📱 **Social Sharing** - Open Graph and Twitter Card tags
- 🤖 **robots.txt** - Proper crawler instructions
- 🔍 **Sitemap Ready** - Prepared for search engine indexing

## 📁 Project Structure

```
pan_uk_frontend/
├── public/
│   ├── robots.txt           # Crawler instructions
│   └── panuk-logo.png       # Business logo
├── src/
│   ├── components/
│   │   ├── SEO/             # ✨ SEO components
│   │   │   ├── SEO.jsx     # Main SEO component
│   │   │   └── index.js    # Export index
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx         # Homepage (SEO optimized)
│   │   ├── ProductDetail.jsx # Product pages (SEO optimized)
│   │   ├── CategoryPage.jsx # Category pages (SEO optimized)
│   │   ├── AllProducts.jsx  # Product listing (SEO optimized)
│   │   └── ...
│   ├── utils/
│   │   └── seo/             # ✨ SEO utilities
│   │       ├── structuredData.js  # Schema.org generators
│   │       ├── keywords.js        # SEO keywords library
│   │       └── sitemap.js         # Sitemap utilities
│   └── ...
├── index.html               # Base HTML with meta tags
├── SEO_DOCUMENTATION.md     # ✨ Complete SEO guide
├── SEO_QUICK_REFERENCE.md   # ✨ Quick reference
├── SEO_SUMMARY.md           # ✨ Implementation summary
├── TESTING_GUIDE.md         # ✨ Testing instructions
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **HTTP Client**: Axios 1.11.0
- **Styling**: SASS/SCSS
- **Icons**: React Icons, Lucide React
- **SEO**: Custom implementation with Schema.org

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd pan_uk_frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_URL=https://panukonline.com/
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔍 SEO Implementation

### Key SEO Features

#### 1. Meta Tags
- ✅ Title tags (50-60 characters)
- ✅ Meta descriptions (under 160 characters)
- ✅ Keywords meta tags
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Geographic meta tags

#### 2. Structured Data (Schema.org)
- ✅ **LocalBusiness** - Business information
- ✅ **Product** - Product details
- ✅ **BreadcrumbList** - Navigation
- ✅ **CollectionPage** - Category pages
- ✅ **Organization** - Company data

#### 3. Local SEO
- ✅ Business NAP (Name, Address, Phone)
- ✅ Geographic coordinates
- ✅ Location keywords (Kasaragod, Anebagilu, Dwarka Road)
- ✅ Opening hours
- ✅ Service area

#### 4. Content Optimization
- ✅ Keyword-rich headings
- ✅ Natural language content
- ✅ Location-aware copy
- ✅ Descriptive image alt text

### SEO Documentation
- 📖 **Complete Guide**: `SEO_DOCUMENTATION.md`
- ⚡ **Quick Reference**: `SEO_QUICK_REFERENCE.md`
- 📋 **Summary**: `SEO_SUMMARY.md`
- 🧪 **Testing**: `TESTING_GUIDE.md`

## 🧪 Testing

### Run Tests
```bash
# Check for errors
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### SEO Testing
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Validator**: https://validator.schema.org/
3. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
4. **robots.txt**: Visit `/robots.txt` on your domain

See `TESTING_GUIDE.md` for detailed testing instructions.

## 📊 SEO Keywords

### Primary Keywords
- Pan UK Kasaragod
- fashion store Kasaragod
- clothing shop Anebagilu
- premium fashion Dwarka Road
- Mall of Kasaragod fashion

### Location Modifiers
- Kasaragod, Kerala
- Anebagilu
- Dwarka Road
- Mall of Kasaragod

See `SEO_QUICK_REFERENCE.md` for complete keyword list.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Post-Deployment Checklist
- [ ] Submit sitemap to Google Search Console
- [ ] Verify structured data with Rich Results Test
- [ ] Set up Google Analytics
- [ ] Create/optimize Google My Business listing
- [ ] Test all pages on production URL
- [ ] Monitor Search Console for indexing status

## 🔧 Configuration

### API Configuration
Update `VITE_API_URL` in `.env` file:
```env
VITE_API_URL=https://panukonline.com/
```

### SEO Configuration
Business information can be updated in:
- `src/utils/seo/structuredData.js` - Business details, coordinates
- `src/utils/seo/keywords.js` - Keywords, content snippets

## 📱 Social Media

- **Instagram**: [@pan.uk_](https://www.instagram.com/pan.uk_/)
- **JustDial**: [Pan UK Listing](https://www.justdial.com/Kasaragod/Pan-Uk-Anebagilu-Dwaraka-Road/9999P4994-4994-250410133906-Z4L8_BZDET)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support or inquiries:
- **Phone**: +91 89218 16174
- **Instagram**: @pan.uk_
- **Website**: https://panukonline.com

---

## 🎨 Design Philosophy

✅ **No design changes made during SEO optimization**  
✅ **Original layout preserved**  
✅ **Existing styles maintained**  
✅ **Only text content and meta data updated**

---

**Built with ❤️ for Pan UK, Kasaragod**

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
