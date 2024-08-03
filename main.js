const apiKey = "f7c16c474fd8c915203d046558be0cfa";

// DOM elements

const heroList = document.querySelector("#hero-list");
const todayDate = document.querySelector("#today-date");
const todayDegree = document.querySelector("#today-degree");
const todayCondition = document.querySelector("#today-condition");
const todayLocation = document.querySelector("#today-location");
const sunriseTime = document.querySelector("#sunrise-time");
const todayPic = document.querySelector("#today-icon");

const sunsetTime = document.querySelector("#sunset-time");
const windSpeed = document.querySelector("#wind-speed");
const humidity = document.querySelector("#humidity");
const pressure = document.querySelector("#pressure");
const hourlyForecast = document.querySelector("#hourly-forecast");
const fiveDayList = document.querySelector("#five-day-list");
const fiveDayItemTemplate = document.querySelector("#five-day-item-template");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-input");

// default cities
const defaultCities = ["London", "New York", "Paris", "Tokyo", "Berlin"];
const defaultCityForDetailedView = "Tashkent";

// initialize the app with default data
async function initialize() {
  heroList.innerHTML = "";
  for (const city of defaultCities) {
    await fetchWeatherData(city, false);

  }
  await fetchWeatherData(defaultCityForDetailedView, true);
}

// fetch weather data

async function fetchWeatherData(city, isDetailedView) {
  try {
    const weatherResponse = await fetch(`
      https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const weatherData = await weatherResponse.json();

    if (weatherData.cod === 200) {
      if (isDetailedView) {
        updateCurrentWeather(weatherData);
        await fetchForecastData(weatherData.coord.lat, weatherData.coord.lon);

      } else {
        addToHeroList(weatherData);

      }
    } else {
      alert(weatherData.message);

    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}
// fetch 5-day forecast 

async function fetchForecastData(lat, lon) {
  try {
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const forecastData = await forecastResponse.json();

    if (forecastData.cod === "200") {
      updateForecast(forecastData);
    } else {
      console.error("Error fetching forecast data:", forecastData.message);

    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);

  }
}


function addToHeroList(data) {
  const heroItemClone = document.createElement("li");
  heroItemClone.className = "hero-item flex  justify-between rounded-md py-6 px-4 ";

  heroItemClone.innerHTML = `
  <div class="county-details flex flex-col gap-y-2">
        <span class="country-name text-lg">${data.sys.country}</span>
        <span class="country-capital text-2xl">${data.name}</span>
        <span class="country-condition text-sm">${data.weather[0].main}</span>
      </div>
      <div class="condition-details flex flex-col items-center gap-y-2">
        <img class="condition-pic" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
        <span class="condition-degree">${Math.round(data.main.temp)}°C</span>
        <button
          class="condition-info-link border-b-2 rounded-md  px-2 hover:bg-white hover:text-black transition duration-300" type="button">More
          info</button>
      </div>

  `;
  heroItemClone.querySelector(".condition-info-link").addEventListener("click", () => {
    fetchWeatherData(data.name, true);
  });

  heroList.appendChild(heroItemClone);


}

// update the detailed view with current weather data

function updateCurrentWeather(data) {
  const updateDateTime = () => {
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    todayDate.innerHTML = `${currentDate} <span id="current-time">${currentTime}</span>`;
  };

  todayDegree.textContent = `${Math.round(data.main.temp)}°C`;
  todayCondition.textContent = data.weather[0].main;
  todayLocation.textContent = `${data.name}, ${data.sys.country}`;
  windSpeed.textContent = `${data.wind.speed} m/s`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  todayPic.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  sunriseTime.textContent = convertToLocaleTime(data.sys.sunrise, "Asia/Almaty");
  sunsetTime.textContent = convertToLocaleTime(data.sys.sunset, "Asia/Almaty");

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function convertToLocaleTime(unixTimestamp, timeZone) {
  const date = new Date(unixTimestamp * 1000);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

// update 5-day forecast

function updateForecast(data) {
  fiveDayList.innerHTML = "";

  const dailyData = {};
  data.list.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const dateString = date.toLocaleDateString("en-US", { weekday: "long" });
    if (!dailyData[dateString]) {
      dailyData[dateString] = {
        date: dateString,
        tempMin: forecast.main.temp_min,
        tempMax: forecast.main.temp_max,
        weather: forecast.weather[0].description,
        icon: forecast.weather[0].icon

      };
    } else {
      dailyData[dateString].tempMin = Math.min(dailyData[dateString].tempMin, forecast.main.temp_min);
      dailyData[dateString].tempMax = Math.max(dailyData[dateString].tempMax, forecast.main.temp_max);
    }

  });

  const days = Object.values(dailyData).slice(0, 5);
  days.forEach(day => {
    const fiveDayItemClone = fiveDayItemTemplate.content.cloneNode(true);
    const fiveDayName = fiveDayItemClone.querySelector(".five-day-name");
    const fiveDayTime = fiveDayItemClone.querySelector(".five-day-time");
    const fiveDayDegMin = fiveDayItemClone.querySelector(".five-day-deg-min");
    const fiveDayDegMax = fiveDayItemClone.querySelector(".five-day-deg-max");
    const fiveDayPic = fiveDayItemClone.querySelector(".five-day-pic");
    const fiveDayCondition = fiveDayItemClone.querySelector(".five-day-condition");

    fiveDayName.textContent = day.date;
    fiveDayDegMin.textContent = `${Math.round(day.tempMin)}°C`;
    fiveDayDegMax.textContent = `${Math.round(day.tempMax)}°C`;
    fiveDayPic.src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
    fiveDayCondition.textContent = day.weather;
    fiveDayList.appendChild(fiveDayItemClone);


  })


}

searchForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const city = searchInput.value.trim();
  if (city) {
    await fetchWeatherData(city, true);
    searchInput.value = ""
  }
});
initialize();