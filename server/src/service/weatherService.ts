import dotenv from 'dotenv';
dotenv.config();
import dayjs from 'dayjs';

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  city: string;
  date: string;
  icon: string;
  temperature: number;
  wind: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    temperature: number,
    wind: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.temperature = temperature;
    this.wind = wind;
    this.humidity = humidity;
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseURL?: string;
  private apiKey?: string;
  private cityName = "";

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.API_KEY || "";

    if (!this.apiKey) {
      console.error("API key is missing");
    }
    if (!this.baseURL) {
      console.error("Base URL is missing");
    }
  }

  // Fetch location data
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        return { error: `Failed to fetch location data: ${response.statusText}` };
      }

      const locationData = await response.json();
      if (!locationData || !Array.isArray(locationData) || locationData.length === 0) {
        return { error: "Location not found. Please enter a valid city name." };
      }

      return locationData;
    } catch (err) {
      console.error("Error in fetchLocationData:", err);
      return { error: "Unable to fetch location data. Please try again." };
    }
  }

  // Destructure location data
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  // Build geocode query
  private buildGeocodeQuery(): string {
    if (!this.cityName || !this.apiKey) {
      console.error("City name or API key is missing");
      return "";
    }

    const geoCodeQuery = `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(
      this.cityName
    )}&appid=${this.apiKey}`;
    return geoCodeQuery;
  }

  // Build weather query
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
    return weatherQuery;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData(): Promise<Coordinates | { error: string }> {
    const geoCodeQuery = this.buildGeocodeQuery();
    if (!geoCodeQuery) return { error: "Geocode query could not be built." };

    const locationData = await this.fetchLocationData(geoCodeQuery);
    if ((locationData as any).error) {
      return locationData;
    }

    const coordinates = this.destructureLocationData(locationData[0]);
    return coordinates;
  }

  // Fetch weather data
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        return { error: `Failed to fetch weather data: ${response.statusText}` };
      }

      const weatherData = await response.json();
      if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
        return { error: "Weather data not available. Try again later." };
      }

      const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
      const forecast = this.buildForecastArray(currentWeather, weatherData.list);
      return forecast;
    } catch (err) {
      console.error("Error in fetchWeatherData:", err);
      return { error: "Unable to fetch weather data. Please try again." };
    }
  }

  // Parse current weather
  private parseCurrentWeather(response: any): Weather {
    const date = dayjs.unix(response.dt).format('MM/DD/YYYY');

    let icon = response.weather[0].icon;
    if (icon.endsWith('n')) {
      icon = icon.replace('n', 'd');
    }

    const temperature = response.main.temp;
    const wind = response.wind.speed;
    const humidity = response.main.humidity;

    return new Weather(this.cityName, date, icon, temperature, wind, humidity);
  }

  // Build forecast array
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecast = [currentWeather];

    const filteredWeatherData = weatherData.filter((data: any) => {
      return data.dt_txt.includes('12:00:00');
    });

    for (const day of filteredWeatherData) {
      const date = dayjs.unix(day.dt).format('MM/DD/YYYY');

      let icon = day.weather[0].icon;
      if (icon.endsWith('n')) {
        icon = icon.replace('n', 'd');
      }

      const temperature = day.main.temp;
      const wind = day.wind.speed;
      const humidity = day.main.humidity;
      forecast.push(new Weather(this.cityName, date, icon, temperature, wind, humidity));
    }

    return forecast;
  }

  // Get weather for city
  async getWeatherForCity(city: string): Promise<any> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    if ((coordinates as any).error) {
      return coordinates;
    }

    const weather = await this.fetchWeatherData(coordinates as Coordinates);
    return weather;
  }
}

export default new WeatherService();
