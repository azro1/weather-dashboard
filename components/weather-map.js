'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Thermometer, CloudRain, Wind, Gauge, Cloud } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WeatherMap = ({ currentWeather, onLocationSelect }) => {
  const [activeLayer, setActiveLayer] = useState('temp');
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (currentWeather?.coords) {
      setMapCenter([currentWeather.coords.lat, currentWeather.coords.lon]);
    }
  }, [currentWeather]);

  const getWeatherLayerUrl = (layer) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) return null;
    
    const layerMap = {
      temp: 'temp_new',
      precipitation: 'precipitation_new',
      wind: 'wind_new',
      pressure: 'pressure_new',
      clouds: 'clouds_new'
    };
    
    return `https://tile.openweathermap.org/map/${layerMap[layer]}/{z}/{x}/{y}.png?appid=${apiKey}`;
  };

  const layerButtons = [
    { id: 'temp', label: 'Temperature', icon: Thermometer, color: 'from-red-500 to-orange-500' },
    { id: 'precipitation', label: 'Precipitation', icon: CloudRain, color: 'from-blue-500 to-cyan-500' },
    { id: 'wind', label: 'Wind Speed', icon: Wind, color: 'from-emerald-500 to-teal-500' },
    { id: 'pressure', label: 'Pressure', icon: Gauge, color: 'from-purple-500 to-pink-500' },
    { id: 'clouds', label: 'Cloud Cover', icon: Cloud, color: 'from-gray-500 to-slate-500' }
  ];

  const WeatherOverlay = () => {
    const layerUrl = getWeatherLayerUrl(activeLayer);
    if (!layerUrl) return null;

    return (
      <TileLayer
        url={layerUrl}
        opacity={0.6}
        attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Layer Controls */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {layerButtons.map((layer) => {
          const Icon = layer.icon;
          return (
            <Button
              key={layer.id}
              variant={activeLayer === layer.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLayer(layer.id)}
              className={`p-3 flex gap-1.5 transition-all duration-300 rounded-xl border ${
                activeLayer === layer.id
                  ? `bg-gradient-to-r ${layer.color} text-white border-transparent shadow-lg`
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <Icon className="inline" />
              <span>{layer.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Map Container */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              Interactive Weather Map
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1 rounded-full">
              {layerButtons.find(l => l.id === activeLayer)?.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 lg:h-[500px] relative">
            {process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ? (
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                className="rounded-b-2xl"
              >
                {/* Base Map Layer */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Weather Overlay */}
                <WeatherOverlay />
                
                {/* Current Location Marker */}
                {currentWeather?.coords && (
                  <Marker position={[currentWeather.coords.lat, currentWeather.coords.lon]}>
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold text-lg mb-2">{currentWeather.location}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Temperature:</span>
                            <span className="font-semibold">{currentWeather.temperature}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Condition:</span>
                            <span className="font-semibold capitalize">{currentWeather.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Humidity:</span>
                            <span className="font-semibold">{currentWeather.humidity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wind:</span>
                            <span className="font-semibold">{currentWeather.windSpeed} km/h</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-teal-900/50 rounded-b-2xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">API Key Required</h3>
                  <p className="text-gray-300 text-sm max-w-md">
                    Add your OpenWeatherMap API key to enable interactive weather maps with live data overlays.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Map Legend</h3>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-1 rounded-full">
              {layerButtons.find(l => l.id === activeLayer)?.label}
            </Badge>
          </div>
          
          {activeLayer === 'temp' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-300 text-sm">Cold (&lt; 0°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300 text-sm">Cool (0-15°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300 text-sm">Warm (15-25°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300 text-sm">Hot (&gt; 25°C)</span>
              </div>
            </div>
          )}
          
          {activeLayer === 'precipitation' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-300 text-sm">No Rain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span className="text-gray-300 text-sm">Light Rain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-300 text-sm">Moderate Rain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-700 rounded"></div>
                <span className="text-gray-300 text-sm">Heavy Rain</span>
              </div>
            </div>
          )}
          
          {activeLayer === 'wind' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span className="text-gray-300 text-sm">Calm (&lt; 5 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-gray-300 text-sm">Light (5-15 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-300 text-sm">Moderate (15-30 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-gray-300 text-sm">Strong (&gt; 30 km/h)</span>
              </div>
            </div>
          )}
          
          {activeLayer === 'pressure' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-400 rounded"></div>
                <span className="text-gray-300 text-sm">Low (&lt; 1000 hPa)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span className="text-gray-300 text-sm">Normal (1000-1020 hPa)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span className="text-gray-300 text-sm">High (&gt; 1020 hPa)</span>
              </div>
            </div>
          )}
          
          {activeLayer === 'clouds' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-gray-300 text-sm">Clear (0-25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-gray-300 text-sm">Partly Cloudy (25-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span className="text-gray-300 text-sm">Mostly Cloudy (50-75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-800 rounded"></div>
                <span className="text-gray-300 text-sm">Overcast (&gt; 75%)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherMap;