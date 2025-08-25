import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTemperature(temp, unit = 'C') {
  return `${Math.round(temp)}°${unit}`;
}

export function formatWindSpeed(speed, unit = 'm/s') {
  return `${speed.toFixed(1)} ${unit}`;
}

export function formatPressure(pressure) {
  return `${pressure} hPa`;
}

export function formatVisibility(visibility) {
  if (!visibility) return 'N/A';
  return `${(visibility / 1000).toFixed(1)} km`;
}

export function getWindDirection(degrees) {
  if (!degrees && degrees !== 0) return 'N/A';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

export function kelvinToFahrenheit(kelvin) {
  return (kelvin - 273.15) * 9/5 + 32;
}

export function metersPerSecondToKmh(mps) {
  return mps * 3.6;
}

export function metersPerSecondToMph(mps) {
  return mps * 2.237;
}