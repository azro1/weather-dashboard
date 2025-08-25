# Weather Dashboard

A comprehensive, modern weather dashboard built with Next.js 14+ and the App Router. This application provides detailed weather information, interactive maps, analytics, and forecasting capabilities.

## 🌟 Features

### Core Functionality
- **Current Weather Display**: Real-time weather conditions with beautiful, weather-responsive UI
- **7-Day Forecast**: Detailed daily and hourly forecasts with visual charts
- **Location Management**: Geolocation detection, manual search, and favorite locations
- **Weather Alerts**: Real-time weather warnings and advisories
- **Air Quality Index**: Detailed air pollution data and health recommendations

### Interactive Elements
- **Weather Maps**: Multiple overlay layers (temperature, precipitation, wind, pressure)
- **Data Visualization**: Historical data charts and weather analytics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme switching with weather-appropriate colors

### Advanced Features
- **Sun & Moon Info**: Sunrise/sunset times, lunar phases, and solar progression
- **Weather Analytics**: Trend analysis and comparative weather data
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Loading States**: Skeleton screens and proper error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- OpenWeatherMap API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd weather-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Get OpenWeatherMap API Key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Create a free account
   - Generate an API key
   - Add the key to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **React 18**: Latest React features and concurrent rendering
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Animation and transitions library
- **Lucide React**: Beautiful, customizable icons

### UI Components
- **Radix UI**: Accessible, unstyled UI primitives
- **Shadcn/ui**: Pre-built component library
- **Chart.js**: Data visualization and charting
- **React Chart.js 2**: React wrapper for Chart.js

### APIs & Data
- **OpenWeatherMap API**: Weather data and forecasting
- **Geolocation API**: Browser location services
- **Local Storage**: Favorite locations persistence

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile** (< 768px): Optimized touch interface, stacked layouts
- **Tablet** (768px - 1024px): Balanced grid layouts, touch-friendly
- **Desktop** (> 1024px): Full feature set, multi-column layouts

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (weather theme)
- **Secondary**: Complementary accent colors
- **Weather-Responsive**: Dynamic colors based on conditions
- **Accessibility**: WCAG 2.1 AA compliant contrast ratios

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Consistent type scale with semantic sizing
- **Line Height**: Optimized for readability (120% for headings, 150% for body)

### Spacing
- **8px Grid System**: Consistent spacing throughout
- **Component Spacing**: Logical spacing relationships
- **Responsive Spacing**: Scales appropriately across breakpoints

## 🗂️ Project Structure

```
weather-dashboard/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.js          # Root layout component
│   └── page.js            # Home page component
├── components/            # React components
│   ├── ui/               # Base UI components (buttons, cards, etc.)
│   ├── current-weather.js # Current weather display
│   ├── weather-forecast.js# Forecast components
│   ├── weather-map.js    # Interactive map component
│   ├── weather-charts.js # Analytics and charts
│   ├── air-quality.js    # Air quality component
│   ├── location-search.js# Location search functionality
│   ├── favorite-locations.js # Favorites management
│   ├── sun-moon-info.js  # Solar and lunar information
│   ├── weather-alerts.js # Weather alerts and warnings
│   ├── weather-icon.js   # Weather condition icons
│   ├── navbar.js         # Navigation component
│   ├── theme-provider.js # Theme context provider
│   └── theme-toggle.js   # Dark/light mode toggle
├── hooks/                # Custom React hooks
│   ├── use-weather.js    # Weather data management
│   └── use-geolocation.js# Geolocation functionality
├── lib/                  # Utility functions
│   └── utils.js          # Helper functions and utilities
├── public/               # Static assets
└── README.md            # This file
```

## 🔧 Configuration

### Tailwind CSS
The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended spacing scale
- Animation utilities
- Dark mode support

### Next.js
Configuration includes:
- Static export capability
- Image optimization
- ESLint integration
- Performance optimizations

## 🌐 API Integration

### OpenWeatherMap API Endpoints
- **Current Weather**: `/weather` - Current conditions
- **5-Day Forecast**: `/forecast` - Hourly forecasts
- **Air Pollution**: `/air_pollution` - Air quality data
- **Geocoding**: `/geo/direct` - Location search

### Error Handling
- Graceful API failure handling
- Fallback data for demo purposes
- User-friendly error messages
- Retry mechanisms where appropriate

## 🎯 Performance Optimizations

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: API response caching
- **Bundle Analysis**: Optimized bundle size

## ♿ Accessibility Features

- **ARIA Labels**: Comprehensive labeling
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Compatible with assistive technology
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Proper focus handling

## 🧪 Testing

The application includes:
- Component-level error boundaries
- Input validation and sanitization
- API error handling
- Responsive design testing
- Cross-browser compatibility

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Static Export
The app is configured for static export and can be deployed to:
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site hosting
- **GitHub Pages**: Via static export
- **Any CDN**: Static file hosting

### Environment Variables
Ensure production environment includes:
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_production_api_key
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📞 Support

For support or questions, please create an issue in the GitHub repository.

---

**Built with ❤️ using Next.js and modern web technologies**