
// ====================================
// 1. SELECT HTML ELEMENTS
// ====================================

const searchForm = document.getElementById("search-form");

const cityInput = document.getElementById("city-input");

const message = document.getElementById("message");

const weatherSection = document.getElementById("weather-section");


// ====================================
// 2. GET CITY COORDINATES
// ====================================

async function getCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for this city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Try another city.");
    }

    return data.results[0];

}


// ====================================
// 3. GET WEATHER INFORMATION
// ====================================

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to retrieve weather data.");
    }

    const data = await response.json();

    return data;

}


// ====================================
// 4. WEATHER CODE INTERPRETATION
// ====================================

function getWeatherInfo(code) {

    const weatherConditions = {

        0: { description: "Clear sky", icon: "☀️" },
        1: { description: "Mainly clear", icon: "🌤️" },
        2: { description: "Partly cloudy", icon: "⛅" },
        3: { description: "Overcast", icon: "☁️" },

        45: { description: "Fog", icon: "🌫️" },
        48: { description: "Rime fog", icon: "🌫️" },

        51: { description: "Light drizzle", icon: "🌦️" },
        53: { description: "Moderate drizzle", icon: "🌦️" },
        55: { description: "Dense drizzle", icon: "🌧️" },

        61: { description: "Slight rain", icon: "🌧️" },
        63: { description: "Moderate rain", icon: "🌧️" },
        65: { description: "Heavy rain", icon: "🌧️" },

        71: { description: "Slight snowfall", icon: "❄️" },
        73: { description: "Moderate snowfall", icon: "❄️" },
        75: { description: "Heavy snowfall", icon: "❄️" },

        80: { description: "Slight rain showers", icon: "🌦️" },
        81: { description: "Moderate rain showers", icon: "🌧️" },
        82: { description: "Heavy rain showers", icon: "⛈️" },

        95: { description: "Thunderstorm", icon: "⛈️" },
        96: { description: "Thunderstorm with hail", icon: "⛈️" },
        99: { description: "Heavy thunderstorm", icon: "⛈️" }

    };

    return weatherConditions[code] || {
        description: "Unknown condition",
        icon: "🌡️"
    };

}


// ====================================
// 5. DISPLAY CURRENT WEATHER
// ====================================

function displayWeather(location, data) {

    const current = data.current;

    const weather = getWeatherInfo(current.weather_code);

    document.getElementById("city-name").textContent =
        `${location.name}, ${location.country}`;

    document.getElementById("temperature").textContent =
        `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("weather-description").textContent =
        weather.description;

    document.getElementById("weather-icon").textContent =
        weather.icon;

    document.getElementById("feels-like").textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
        `${current.wind_speed_10m} km/h`;

    document.getElementById("precipitation").textContent =
        `${current.precipitation} mm`;

    document.getElementById("date").textContent =
        `Updated: ${current.time.replace("T", " ")}`;

    weatherSection.classList.remove("hidden");

}


// ====================================
// 6. DISPLAY WEATHER FORECAST
// ====================================

function displayForecast(daily) {

    const forecastContainer =
        document.getElementById("forecast");

    forecastContainer.replaceChildren();

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(
            `${daily.time[i]}T12:00:00`
        );

        const day = date.toLocaleDateString("en", {
            weekday: "short"
        });

        const weather = getWeatherInfo(
            daily.weather_code[i]
        );

        const card = document.createElement("div");

        card.className = "forecast-card";

        const dayElement = document.createElement("p");
        dayElement.textContent = day;

        const iconElement = document.createElement("div");
        iconElement.className = "forecast-icon";
        iconElement.textContent = weather.icon;

        const maxTemp = document.createElement("h3");
        maxTemp.textContent =
            `${Math.round(daily.temperature_2m_max[i])}°C`;

        const minTemp = document.createElement("small");
        minTemp.textContent =
            `${Math.round(daily.temperature_2m_min[i])}°C`;

        const description = document.createElement("p");
        description.textContent = weather.description;

        card.append(
            dayElement,
            iconElement,
            maxTemp,
            minTemp,
            description
        );

        forecastContainer.appendChild(card);

    }

}


// ====================================
// 7. HANDLE CITY SEARCH
// ====================================

async function searchWeather(city) {

    try {

        message.textContent = "Searching for weather...";

        weatherSection.classList.add("hidden");

        // First API request: Get coordinates

        const location = await getCoordinates(city);

        console.log("Location:", location);

        // Second API request: Get weather

        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        );

        console.log("Weather:", weatherData);

        // Display current weather

        displayWeather(location, weatherData);

        // Display forecast

        displayForecast(weatherData.daily);

        message.textContent = "";

    } catch (error) {

        message.textContent = error.message;

        console.error("Error:", error);

    }

}


// ====================================
// 8. HANDLE FORM SUBMISSION
// ====================================

searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    searchWeather(city);

});


// ====================================
// 9. LOAD DEFAULT CITY
// ====================================

searchWeather("Lagos");
