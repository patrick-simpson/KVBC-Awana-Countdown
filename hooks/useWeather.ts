import { useState, useEffect } from 'react';

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';

const KVBC_LAT = 44.5522;
const KVBC_LON = -69.6317;

function getWeatherType(code: number): WeatherType {
  if (code === 0 || code === 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code <= 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if (code >= 95) return 'thunder';
  return 'clear';
}

export function useWeather(): WeatherType {
  const [weather, setWeather] = useState<WeatherType>('clear');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${KVBC_LAT}&longitude=${KVBC_LON}&current=weather_code`
        );
        const data = await res.json();
        if (data.current?.weather_code !== undefined) {
          setWeather(getWeatherType(data.current.weather_code));
        }
      } catch {
        // silently fail - default 'clear' is acceptable
      }
    };

    fetchWeather();

    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return weather;
}
