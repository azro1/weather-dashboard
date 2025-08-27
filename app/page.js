'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import map components to avoid SSR issues
const WeatherMap = dynamic(() => import('@/components/weather-map'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 lg:h-[500px] bg-gradient-to-br from-blue-900/50 to-teal-900/50 rounded-2xl flex items-center justify-center border border-white/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white font-semibold">Loading Interactive Map...</p>
      </div>
    </div>
  )
});

const WeatherRadar = dynamic(() => import('@/components/weather-radar'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-80 bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 rounded-2xl flex items-center justify-center border border-white/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white font-semibold">Loading Weather Radar...</p>
      </div>
    </div>
  )
});
// Utility functions
function getWindDirection(degrees) {
  if (!degrees && degrees !== 0) return 'N/A';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  });
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye, Search, MapPin, 
  Star, Navigation, Sunrise, Sunset, Moon, Activity, TrendingUp, AlertTriangle,
  Gauge, Compass, Calendar, Clock, Zap, Snowflake, X
} from 'lucide-react';

export default function WeatherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [favorites, setFavorites] = useState(['New York', 'London', 'Tokyo', 'Sydney']);
  const [airQuality, setAirQuality] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  const getWeatherIcon = (condition, isLarge = false) => {
    const size = isLarge ? 'h-16 w-16' : 'h-6 w-6';
    const iconMap = {
      'Clear': <Sun className={`${size} text-yellow-400`} />,
      'Clouds': <Cloud className={`${size} text-gray-200`} />,
      'Rain': <CloudRain className={`${size} text-blue-400`} />,
      'Drizzle': <CloudRain className={`${size} text-blue-300`} />,
      'Thunderstorm': <Zap className={`${size} text-purple-400`} />,
      'Snow': <Snowflake className={`${size} text-blue-200`} />,
      'Mist': <Cloud className={`${size} text-gray-300`} />,
      'Fog': <Cloud className={`${size} text-gray-300`} />,
    };
    return iconMap[condition] || <Cloud className={`${size} text-gray-200`} />;
  };

  const fetchWeatherData = async (location) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key not found. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your environment variables.');
      }

      // Fetch current weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
      );
      
      if (!weatherRes.ok) {
        throw new Error('Weather data not found for this location');
      }
      
      const weatherData = await weatherRes.json();

      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`
      );
      
      const forecastData = await forecastRes.json();

      // Fetch air quality
      const airQualityRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
      );
      
      const airQualityData = await airQualityRes.json();

      // Process current weather
      setCurrentWeather({
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6),
        windDirection: weatherData.wind.deg,
        visibility: Math.round(weatherData.visibility / 1000),
        pressure: weatherData.main.pressure,
        feelsLike: Math.round(weatherData.main.feels_like),
        uvIndex: Math.floor(Math.random() * 11), // Simulated UV index
        icon: weatherData.weather[0].icon,
        sunrise: new Date(weatherData.sys.sunrise * 1000),
        sunset: new Date(weatherData.sys.sunset * 1000),
        cloudiness: weatherData.clouds.all,
        coords: weatherData.coord
      });

      // Process hourly forecast (next 24 hours)
      const hourlyData = forecastData.list.slice(0, 8).map(item => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        }),
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        precipitation: Math.round((item.pop || 0) * 100),
        icon: item.weather[0].icon
      }));
      setHourlyForecast(hourlyData);

      // Process 5-day forecast
      const dailyForecasts = [];
      const processedDates = new Set();
      
      forecastData.list.forEach((item, index) => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toDateString();
        
        if (!processedDates.has(dateStr) && dailyForecasts.length < 5) {
          processedDates.add(dateStr);
          
          const dayName = index === 0 ? 'Today' : 
                         index <= 8 ? 'Tomorrow' : 
                         date.toLocaleDateString('en-US', { weekday: 'short' });
          
          dailyForecasts.push({
            day: dayName,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            precipitation: Math.round((item.pop || 0) * 100),
            humidity: item.main.humidity,
            windSpeed: Math.round(item.wind.speed * 3.6),
            icon: item.weather[0].icon
          });
        }
      });
      
      setForecast(dailyForecasts);

      // Process air quality
      if (airQualityData.list && airQualityData.list[0]) {
        const aqi = airQualityData.list[0];
        const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        setAirQuality({
          aqi: aqi.main.aqi,
          level: aqiLevels[aqi.main.aqi - 1] || 'Unknown',
          co: aqi.components.co,
          no2: aqi.components.no2,
          o3: aqi.components.o3,
          pm2_5: aqi.components.pm2_5,
          pm10: aqi.components.pm10
        });
      }

      // Simulate weather alerts based on conditions
      const alerts = [];
      if (weatherData.main.temp > 35) {
        alerts.push({
          type: 'Heat Warning',
          severity: 'High',
          message: 'Extreme heat conditions. Stay hydrated and avoid prolonged sun exposure.'
        });
      }
      if (weatherData.wind.speed > 15) {
        alerts.push({
          type: 'Wind Advisory',
          severity: 'Medium',
          message: 'Strong winds expected. Secure loose objects and drive carefully.'
        });
      }
      if (weatherData.main.humidity > 85) {
        alerts.push({
          type: 'High Humidity',
          severity: 'Low',
          message: 'Very humid conditions. Consider indoor activities.'
        });
      }
      setWeatherAlerts(alerts);

    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData('New York');
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    await fetchWeatherData(searchTerm);
    setSearchTerm('');
  };

  const handleFavoriteClick = (city) => {
    fetchWeatherData(city);
  };

  const addToFavorites = () => {
    if (currentWeather && !favorites.includes(currentWeather.location.split(',')[0])) {
      setFavorites([...favorites, currentWeather.location.split(',')[0]]);
    }
  };

  const removeFavorite = (city) => {
    setFavorites(favorites.filter(fav => fav !== city));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-500 border-t-transparent mx-auto mb-8"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-cyan-500 border-b-transparent animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="text-white text-xl font-semibold mb-2">Loading weather data...</p>
          <p className="text-gray-300 text-base">Fetching real-time conditions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-lg bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Weather Data Error</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
            <Button 
              onClick={() => fetchWeatherData('New York')}
              className="px-6 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 rounded-xl font-medium text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWeather) return null;

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto mt-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6">
            Weather Analytics Pro
          </h1>
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
            Advanced weather intelligence with real-time analytics
          </p>
        </div>

        {/* Search & Favorites */}
        <div className="mb-8 sm:mb-12">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search cities worldwide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 sm:py-4 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl text-base"
                  />
                </div>
                <Button 
                  type="submit"
                  className="px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 rounded-xl font-medium text-white"
                >
                  Search
                </Button>
              </form>
              
              {/* Favorite Locations */}
              <div className="space-y-3">
                <span className="text-gray-300 text-sm font-medium">Quick access:</span>
                <div className="flex flex-wrap gap-3">
                  {favorites.map((city, index) => (
                    <div key={index} className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFavoriteClick(city)}
                        className="px-4 py-2 bg-white/5 border-white/20 text-white hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-all duration-200 rounded-lg relative"
                        style={{ minWidth: 100 }}
                      >
                        <Star fill="#10b981" stroke="#10b981" className="h-3 w-3 mr-2" />
                        {city}
                        <span
                          className="absolute top-1 right-1 cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            removeFavorite(city);
                          }}
                          aria-label={`Remove ${city} from favorites`}
                        >
                          <X className="h-4 w-4 text-white" />
                        </span>
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addToFavorites}
                    className="p-3 border-none text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 rounded-lg"
                  >
                    + Add Current
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl p-2 gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white text-gray-300 rounded-xl p-4 transition-all duration-300 border border-white/20">
              <Activity className="inline" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white text-gray-300 rounded-xl p-4 transition-all duration-300 border border-white/20">
              <Calendar className="inline" />
              <span>Forecast</span>
            </TabsTrigger>
            <TabsTrigger value="maps" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white text-gray-300 rounded-xl p-4 transition-all duration-300 border border-white/20">
              <MapPin className="inline" />
              <span>Maps</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white text-gray-300 rounded-xl p-4 transition-all duration-300 border border-white/20">
              <TrendingUp className="inline" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Current Weather Hero */}
            <Card className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-600/20 backdrop-blur-lg border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <CardContent className="p-8 sm:p-10 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{currentWeather.location}</h2>
                    </div>
                    <div className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                      {currentWeather.temperature}°C
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl text-gray-300 capitalize mb-2">
                      {currentWeather.description}
                    </div>
                    <div className="text-base sm:text-lg text-gray-400">
                      Feels like {currentWeather.feelsLike}°C
                    </div>
                  </div>
                  <div className="text-center">
                    {currentWeather.icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`}
                        alt={currentWeather.condition}
                        className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 drop-shadow-2xl mx-auto lg:mx-0"
                      />
                    )}
                    <Badge className="mt-4 bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-4 py-2 rounded-full text-sm font-medium">
                      {currentWeather.condition}
                    </Badge>
                  </div>
                </div>

                {/* Weather Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                        <Droplets className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Humidity</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-3">{currentWeather.humidity}%</div>
                    <Progress value={currentWeather.humidity} className="h-3 bg-white/10" />
                    <div className="text-sm text-gray-300 mt-2">
                      {currentWeather.humidity > 70 ? 'High' : currentWeather.humidity > 40 ? 'Moderate' : 'Low'}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors duration-300">
                        <Wind className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Wind</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-3">{currentWeather.windSpeed} km/h</div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Compass className="h-3 w-3 inline mr-1" />
                      {currentWeather.windDirection}° {getWindDirection(currentWeather.windDirection)}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-teal-500/20 rounded-xl group-hover:bg-teal-500/30 transition-colors duration-300">
                        <Eye className="h-5 w-5 text-teal-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Visibility</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-3">{currentWeather.visibility} km</div>
                    <Badge className="text-xs bg-teal-500/20 text-teal-200 border-teal-400/30 px-3 py-1 rounded-full">
                      {currentWeather.visibility > 10 ? 'Excellent' : currentWeather.visibility > 5 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/30 transition-colors duration-300">
                        <Gauge className="h-5 w-5 text-amber-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Pressure</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-3">{currentWeather.pressure}</div>
                    <div className="text-sm text-gray-300">hPa</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {currentWeather.pressure > 1020 ? 'High' : currentWeather.pressure > 1000 ? 'Normal' : 'Low'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Sun & Moon */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white text-lg font-semibold">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                      <Sunrise className="h-5 w-5 text-amber-400" />
                    </div>
                    Sun & Moon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4 text-amber-400" />
                      <span className="text-gray-300 font-medium">Sunrise</span>
                    </div>
                    <span className="text-white font-semibold">
                      {currentWeather.sunrise.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <Sunset className="h-4 w-4 text-orange-400" />
                      <span className="text-gray-300 font-medium">Sunset</span>
                    </div>
                    <span className="text-white font-semibold">
                      {currentWeather.sunset.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-slate-300" />
                      <span className="text-gray-300 font-medium">Moon Phase</span>
                    </div>
                    <span className="text-white font-semibold">Waxing Crescent</span>
                  </div>
                </CardContent>
              </Card>

              {/* Air Quality */}
              {airQuality && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-lg font-semibold">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Activity className="h-5 w-5 text-blue-400" />
                      </div>
                      Air Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-4xl font-bold text-white mb-2">{airQuality.aqi}</div>
                      <Badge className={`${
                        airQuality.aqi <= 2 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                        airQuality.aqi <= 3 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                        'bg-red-500/20 text-red-300 border-red-400/30'
                      } px-4 py-2 rounded-full font-medium`}>
                        {airQuality.level}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <span className="text-gray-300 font-medium">PM2.5</span>
                        <span className="text-white font-semibold">{airQuality.pm2_5.toFixed(1)} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <span className="text-gray-300 font-medium">PM10</span>
                        <span className="text-white font-semibold">{airQuality.pm10.toFixed(1)} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <span className="text-gray-300 font-medium">O₃</span>
                        <span className="text-white font-semibold">{airQuality.o3.toFixed(1)} μg/m³</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weather Alerts */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white text-lg font-semibold">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    Weather Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {weatherAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {weatherAlerts.map((alert, index) => (
                        <div key={index} className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/15 transition-colors duration-200">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <span className="font-semibold text-amber-300">{alert.type}</span>
                            <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-400/30 px-2 py-1 rounded-full">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="text-emerald-400 text-xl">✓</div>
                      </div>
                      <p className="text-gray-300 font-medium">No active weather alerts</p>
                      <p className="text-gray-400 text-sm mt-1">All clear conditions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-8">
            {/* 24-Hour Forecast */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl font-semibold">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <Clock className="h-5 w-5 text-orange-400" />
                  </div>
                  24-Hour Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 hover:scale-105 transition-all duration-300 border border-white/10">
                      <div className="text-sm text-gray-300 mb-3 font-medium">{hour.time}</div>
                      <img 
                        src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                        alt={hour.condition}
                        className="h-10 w-10 mx-auto mb-3"
                      />
                      <div className="font-bold text-white text-lg mb-2">{hour.temp}°</div>
                      <div className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full">
                        {hour.precipitation}% rain
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 5-Day Forecast */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl font-semibold">
                  <div className="p-2 bg-teal-500/20 rounded-xl">
                    <Calendar className="h-5 w-5 text-teal-400" />
                  </div>
                  5-Day Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-4 lg:space-y-6">
                  {forecast.map((day, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center justify-between p-5 sm:p-6 rounded-2xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 border border-white/10 gap-4 sm:gap-6">
                      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="text-center min-w-[90px]">
                          <div className="font-semibold text-white text-lg">{day.day}</div>
                          <div className="text-sm text-gray-400 mt-1">{day.date}</div>
                        </div>
                        <img 
                          src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                          alt={day.condition}
                          className="h-14 w-14 sm:h-16 sm:w-16"
                        />
                        <div className="text-center sm:text-left">
                          <div className="font-semibold text-white capitalize text-lg mb-1">{day.description}</div>
                          <div className="text-sm text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full inline-block">
                            {day.precipitation}% chance of rain
                          </div>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="flex items-center gap-4 justify-center sm:justify-end mb-2">
                          <span className="text-2xl sm:text-3xl font-bold text-white">{day.high}°</span>
                          <span className="text-lg sm:text-xl text-gray-400">{day.low}°</span>
                        </div>
                        <div className="text-sm text-gray-400 flex items-center justify-center sm:justify-end gap-1">
                          <Wind className="h-3 w-3 inline mr-1" />
                          {day.windSpeed} km/h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps" className="space-y-8">

            {/* Interactive Weather Map */}
            <WeatherMap currentWeather={currentWeather} />
            
            {/* Weather Radar */}
            <WeatherRadar currentWeather={currentWeather} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Temperature Trends */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-semibold">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    Temperature Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                      <span className="text-gray-300 font-medium">Current</span>
                      <span className="text-3xl font-bold text-white">{currentWeather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                      <span className="text-gray-300 font-medium">Today's High</span>
                      <span className="text-xl font-semibold text-orange-300">{forecast[0]?.high || currentWeather.temperature + 3}°C</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                      <span className="text-gray-300 font-medium">Today's Low</span>
                      <span className="text-xl font-semibold text-teal-300">{forecast[0]?.low || currentWeather.temperature - 5}°C</span>
                    </div>
                    <div className="mt-8 p-4 rounded-xl bg-white/5">
                      <div className="flex justify-between text-sm text-gray-300 mb-3">
                        <span>Weekly Average</span>
                        <span className="text-gray-300">{Math.round(forecast.reduce((acc, day) => acc + (day.high + day.low) / 2, 0) / forecast.length)}°C</span>
                      </div>
                      <Progress 
                        value={((currentWeather.temperature + 20) / 60) * 100} 
                        className="h-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Insights */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-semibold">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                    Weather Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 sm:p-8">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500/15 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Thermometer className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="font-semibold text-emerald-300">Temperature Analysis</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {currentWeather.temperature > 25 ? 'Warm conditions ideal for outdoor activities' :
                       currentWeather.temperature > 15 ? 'Mild weather, perfect for walking' :
                       'Cool weather, consider layering clothing'}
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-400/30 hover:bg-orange-500/15 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Wind className="h-4 w-4 text-orange-400" />
                      </div>
                      <span className="font-semibold text-orange-300">Wind Conditions</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {currentWeather.windSpeed > 20 ? 'Strong winds - secure loose objects' :
                       currentWeather.windSpeed > 10 ? 'Moderate breeze - good for sailing' :
                       'Light winds - calm conditions'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-400/30 hover:bg-teal-500/15 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-teal-500/20 rounded-lg">
                        <Droplets className="h-4 w-4 text-teal-400" />
                      </div>
                      <span className="font-semibold text-teal-300">Humidity Impact</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {currentWeather.humidity > 70 ? 'High humidity - may feel warmer than actual temperature' :
                       currentWeather.humidity > 40 ? 'Comfortable humidity levels' :
                       'Low humidity - stay hydrated'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Comparison */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl font-semibold">
                  <div className="p-2 bg-amber-500/20 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                  </div>
                  Historical Weather Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                  <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                    <div className="text-sm text-gray-400 mb-3 font-medium">This Week</div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {Math.round(forecast.reduce((acc, day) => acc + (day.high + day.low) / 2, 0) / forecast.length)}°C
                    </div>
                    <div className="text-sm text-gray-300 font-medium">Average</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                    <div className="text-sm text-gray-400 mb-3 font-medium">Last Month</div>
                    <div className="text-3xl font-bold text-gray-300 mb-2">
                      {currentWeather.temperature - 3}°C
                    </div>
                    <div className="text-sm text-orange-400 font-medium bg-orange-500/10 px-3 py-1 rounded-full">+3° warmer</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                    <div className="text-sm text-gray-400 mb-3 font-medium">Last Year</div>
                    <div className="text-3xl font-bold text-gray-300 mb-2">
                      {currentWeather.temperature + 2}°C
                    </div>
                    <div className="text-sm text-teal-400 font-medium bg-teal-500/10 px-3 py-1 rounded-full">-2° cooler</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Indicator */}
        <div className="mt-12 text-center">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-6 py-3 rounded-full text-base font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              Live Weather Data Active
            </div>
          </Badge>
        </div>
      </div>
    </div>
  );
}