import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, MapPin, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  uvIndex: number;
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export const WeatherDashboard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState('London');
  const [inputValue, setInputValue] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const API_KEY = 'b6fd43b592c44871c7a41a4698666427'; // OpenWeatherMap free tier key
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}`
      );

      if (!weatherResponse.ok) {
        toast.error('City not found. Please try another search.');
        setLoading(false);
        return;
      }

      const weatherData = await weatherResponse.json();

      const currentWeather: WeatherData = {
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        description: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 10) / 10,
        visibility: Math.round(weatherData.visibility / 1000 * 10) / 10,
        pressure: weatherData.main.pressure,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        uvIndex: 0,
      };

      setWeather(currentWeather);

      // Fetch forecast
      const forecastResponse = await fetch(
        `${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}`
      );

      const forecastData = await forecastResponse.json();
      const dailyForecasts: { [key: string]: ForecastDay } = {};

      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            date,
            maxTemp: Math.round(item.main.temp_max),
            minTemp: Math.round(item.main.temp_min),
            description: item.weather[0].main,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: Math.round(item.wind.speed * 10) / 10,
          };
        } else {
          dailyForecasts[date].maxTemp = Math.max(
            dailyForecasts[date].maxTemp,
            Math.round(item.main.temp_max)
          );
          dailyForecasts[date].minTemp = Math.min(
            dailyForecasts[date].minTemp,
            Math.round(item.main.temp_min)
          );
        }
      });

      setForecast(Object.values(dailyForecasts).slice(0, 5));
      setSearchCity(city);
      toast.success(`Weather for ${city} loaded! 🌤️`);
    } catch (error) {
      toast.error('Failed to fetch weather data. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(searchCity);
  }, [unit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      fetchWeather(inputValue);
      setInputValue('');
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case '01d':
      case '01n':
        return <Sun className="w-16 h-16 text-yellow-400" />;
      case '02d':
      case '02n':
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return <Cloud className="w-16 h-16 text-gray-400" />;
      case '09d':
      case '09n':
      case '10d':
      case '10n':
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      default:
        return <Cloud className="w-16 h-16 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 py-12 px-4">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🌤️ Weather Dashboard</h1>
          <p className="text-blue-100">Real-time weather data for your favorite locations</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for a city..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>

          {/* Unit Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUnit('metric')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                unit === 'metric'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              °C / m/s
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                unit === 'imperial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              °F / mph
            </button>
          </div>
        </div>

        {loading && !weather ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block">
              <Cloud className="w-16 h-16 text-blue-400 animate-bounce" />
            </div>
            <p className="text-gray-600 font-semibold mt-4">Fetching weather data...</p>
          </div>
        ) : weather ? (
          <>
            {/* Current Weather */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side - Main Weather Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h2 className="text-3xl font-bold text-gray-900">
                        {weather.city}, {weather.country}
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-6">Today</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div>{getWeatherIcon(weather.icon)}</div>
                      <div>
                        <p className="text-6xl font-bold text-gray-900">
                          {weather.temperature}°
                        </p>
                        <p className="text-gray-600 text-lg">{weather.description}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Feels like <span className="font-bold text-gray-900">{weather.feelsLike}°</span>
                    </p>
                  </div>
                </div>

                {/* Right Side - Weather Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Humidity */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <p className="text-gray-600 text-sm font-bold">Humidity</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{weather.humidity}%</p>
                  </div>

                  {/* Wind Speed */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-cyan-600" />
                      <p className="text-gray-600 text-sm font-bold">Wind Speed</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {weather.windSpeed} {unit === 'metric' ? 'm/s' : 'mph'}
                    </p>
                  </div>

                  {/* Visibility */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-green-600" />
                      <p className="text-gray-600 text-sm font-bold">Visibility</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{weather.visibility} km</p>
                  </div>

                  {/* Pressure */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-purple-600" />
                      <p className="text-gray-600 text-sm font-bold">Pressure</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{weather.pressure} mb</p>
                  </div>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-bold mb-2">🌅 Sunrise</p>
                  <p className="text-2xl font-bold text-gray-900">{formatTime(weather.sunrise)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-bold mb-2">🌇 Sunset</p>
                  <p className="text-2xl font-bold text-gray-900">{formatTime(weather.sunset)}</p>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">5-Day Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center hover:shadow-md transition"
                    >
                      <p className="text-gray-700 font-bold mb-3">{day.date}</p>
                      <div className="flex justify-center mb-3">
                        {getWeatherIcon(day.icon)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 font-semibold">{day.description}</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-600">High</p>
                          <p className="text-2xl font-bold text-gray-900">{day.maxTemp}°</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Low</p>
                          <p className="text-lg font-bold text-gray-700">{day.minTemp}°</p>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-gray-600 text-xs">💧 {day.humidity}%</p>
                          <p className="text-gray-600 text-xs">💨 {day.windSpeed}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No weather data available. Try searching for a city!</p>
          </div>
        )}
      </div>
    </div>
  );
};
