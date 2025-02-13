import './styles/jass.css';
const API_KEY = "2acb865d0277a70b05b6fb061c040d21";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

async function getForecast(city: string) {
  try {
    console.log(`Fetching forecast for: ${city}`);
    const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    
    // Log full response in console
    console.log("Forecast API Response:", response);

    if (!response.ok) throw new Error(`Forecast not found for: ${city}`);

    const data = await response.json();
    console.log("Forecast Data:", data);

    const forecastContainer = document.getElementById("forecast")!;
    forecastContainer.innerHTML = ""; // Clear previous forecast

    // Loop through forecast (every 8th item = ~24 hours apart)
    for (let i = 0; i < data.list.length; i += 8) {
      const forecast = data.list[i];

      // Format date
      const date = new Date(forecast.dt * 1000).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      // Create forecast card
      const forecastCard = document.createElement("div");
      forecastCard.classList.add("col-md-2", "text-center", "forecast-card");

      forecastCard.innerHTML = `
        <div class="card bg-light p-2">
          <h5>${date}</h5>
          <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" />
          <p>${forecast.main.temp}°C</p>
          <p>${forecast.weather[0].description}</p>
          <p>Wind: ${forecast.wind.speed} m/s</p>
          <p>Humidity: ${forecast.main.humidity}%</p>
        </div>
      `;

      forecastContainer.appendChild(forecastCard);
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

async function getWeather(city: string) {
  try {
    const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    console.log("Weather Data:", data);

    // Display current weather
    const cityName = `${data.name}, ${data.sys.country}`;
    document.getElementById("search-title")!.textContent = cityName;
    document.getElementById("temp")!.textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById("wind")!.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById("humidity")!.textContent = `Humidity: ${data.main.humidity}%`;

    // Display weather icon
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    document.getElementById("weather-img")!.setAttribute("src", weatherIcon);
    document.getElementById("weather-img")!.setAttribute("alt", data.weather[0].description);

    // Call getForecast to display 5-day forecast
    getForecast(city);
  } catch (error) {
    console.error("Error fetching weather:", error);
    alert("City not found. Please try again.");
  }
}


// Event Listener for Search Form
document.getElementById("search-form")!.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = (document.getElementById("search-input") as HTMLInputElement).value.trim();
  if (city) getWeather(city);
});



// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  const response = await fetch('/api/weather/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cityName }),
  });

  const weatherData = await response.json();

  console.log('weatherData: ', weatherData);

  renderCurrentWeather(weatherData[0]);
  renderForecast(weatherData.slice(1));
};

const fetchSearchHistory = async () => {
  const history = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return history;
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  // convert the following to typescript
  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

const renderForecast = (forecast: any): void => {
  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: any) => {
  const historyList = await searchHistory.json();

  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = '';

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
    }

    // * Start at end of history array and count down to show the most recent cities at the top.
    for (let i = historyList.length - 1; i >= 0; i--) {
      const historyItem = buildHistoryListItem(historyList[i]);
      searchHistoryContainer.append(historyItem);
    }
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();

  if (!searchInput.value) {
    throw new Error('City cannot be blank');
  }

  const search: string = searchInput.value.trim();
  fetchWeather(search).then(() => {
    getAndRenderHistory();
  });
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches('.history-btn')) {
    const city = event.target.textContent;
    fetchWeather(city).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  const cityID = JSON.parse(event.target.getAttribute('data-city')).id;
  deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();
