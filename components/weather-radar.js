'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Play, Pause, RotateCcw, Zap } from 'lucide-react';

const WeatherRadar = ({ currentWeather }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulate radar animation frames
  const totalFrames = 8;
  
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const getRadarIntensity = () => {
    if (!currentWeather) return 'low';
    
    const { condition, windSpeed, humidity } = currentWeather;
    
    if (condition === 'Thunderstorm' || windSpeed > 25) return 'high';
    if (condition === 'Rain' || condition === 'Drizzle' || humidity > 80) return 'medium';
    return 'low';
  };

  const intensity = getRadarIntensity();
  
  const intensityColors = {
    low: 'from-emerald-500/20 to-cyan-500/20',
    medium: 'from-yellow-500/30 to-orange-500/30',
    high: 'from-red-500/40 to-purple-500/40'
  };

  const intensityLabels = {
    low: 'Light Activity',
    medium: 'Moderate Activity', 
    high: 'Intense Activity'
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            Weather Radar
          </div>
          <Badge className={`${
            intensity === 'high' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
            intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
            'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
          } px-3 py-1 rounded-full`}>
            {intensityLabels[intensity]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Radar Display */}
        <div className={`h-64 md:h-80 bg-gradient-to-br ${intensityColors[intensity]} rounded-2xl flex items-center justify-center border border-white/20 relative overflow-hidden`}>
          {/* Animated Radar Sweep (Ping) - perfectly round and centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`absolute block border-2 rounded-full ${
                  intensity === 'high' ? 'border-red-400/30' :
                  intensity === 'medium' ? 'border-yellow-400/30' :
                  'border-emerald-400/30'
                } animate-ping`}
                style={{
                  width: `calc(100% - ${i * 40}px)`,
                  height: `calc(100% - ${i * 40}px)`,
                  left: `${i * 20}px`,
                  top: `${i * 20}px`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>

          {/* Radar Sweep */}
          <div className="relative z-10">
            <div className="h-32 w-32 md:h-40 md:w-40 border-2 border-emerald-400/50 rounded-full relative">
              {/* Concentric circles */}
              <div className="absolute inset-4 border border-emerald-400/30 rounded-full"></div>
              <div className="absolute inset-8 border border-emerald-400/20 rounded-full"></div>
              
              {/* Radar sweep line */}
              <div 
                className={`absolute top-1/2 left-1/2 w-1 origin-bottom ${
                  intensity === 'high' ? 'bg-red-400' :
                  intensity === 'medium' ? 'bg-yellow-400' :
                  'bg-emerald-400'
                } transition-all duration-500`}
                style={{
                  height: '50%',
                  transform: `translate(-50%, -100%) rotate(${currentFrame * 45}deg)`,
                  boxShadow: `0 0 10px ${
                    intensity === 'high' ? '#f87171' :
                    intensity === 'medium' ? '#fbbf24' :
                    '#34d399'
                  }`
                }}
              />
              
              {/* Weather activity dots */}
              {currentWeather && (
                <>
                  <div className={`absolute w-2 h-2 ${
                    intensity === 'high' ? 'bg-red-400' :
                    intensity === 'medium' ? 'bg-yellow-400' :
                    'bg-emerald-400'
                  } rounded-full animate-pulse`} 
                  style={{ top: '30%', left: '60%' }} />
                  <div className={`absolute w-1.5 h-1.5 ${
                    intensity === 'high' ? 'bg-red-300' :
                    intensity === 'medium' ? 'bg-yellow-300' :
                    'bg-emerald-300'
                  } rounded-full animate-pulse`} 
                  style={{ top: '70%', left: '40%', animationDelay: '0.5s' }} />
                  {intensity !== 'low' && (
                    <div className={`absolute w-3 h-3 ${
                      intensity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    } rounded-full animate-pulse`} 
                    style={{ top: '50%', left: '25%', animationDelay: '1s' }} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Weather condition indicator */}
          {currentWeather?.condition === 'Thunderstorm' && (
            <div className="absolute top-4 right-4">
              <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handlePlayPause}
            className={`flex gap-1 px-4 rounded-xl font-medium transition-all duration-300 ${
              isPlaying 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex gap-1 px-4 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-medium transition-all duration-300"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Radar Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-sm text-gray-400 mb-1">Range</div>
            <div className="text-lg font-semibold text-white">50 km</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-sm text-gray-400 mb-1">Update</div>
            <div className="text-lg font-semibold text-white">5 min</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-sm text-gray-400 mb-1">Frame</div>
            <div className="text-lg font-semibold text-white">{currentFrame + 1}/{totalFrames}</div>
          </div>
        </div>

        {/* Current Conditions Summary */}
        {currentWeather && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Current Conditions</div>
            <div className="flex flex-col gap-1 text-sm md:flex-row justify-between">
              <div className="flex gap-2">
                <span className="text-gray-300">Condition:</span>
                <span className="text-white font-medium capitalize">{currentWeather.description}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-300">Cloudiness:</span>
                <span className="text-white font-medium">{currentWeather.cloudiness}%</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-300">Wind Speed:</span>
                <span className="text-white font-medium">{currentWeather.windSpeed} km/h</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-300">Visibility:</span>
                <span className="text-white font-medium">{currentWeather.visibility} km</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherRadar;