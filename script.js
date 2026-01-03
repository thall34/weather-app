// if tempScale is true, then temperature readouts will be in Celsius, Fahrenheit if false
var tempScale = true;

const container = document.getElementById("container");

// async function that fetches location weather data from virtual crossing
async function getWeatherData(location) {
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=GCACYYDMAQGHRW9LEL4NCZSRJ`)
        
        if (!response.ok) {
            return new Error("Error, data could not be found")
        }

        const data = await response.json();
        const weekForecast = createWeekForecast(data.days)
        const hourlyForecast = createHourlyForecast(data.days[0].hours)
        displayCurrentDayForecast(location, weekForecast, container);
        displayWeeklyForecast(weekForecast, container);
        displayHourlyForecast(hourlyForecast, container);

    } catch (error) {
        return new Error("Fetch Error");
    }
};

function createDayObject(day) {
    return {
        day: day.datetime,
        icon: day.icon,
        temp: day.temp,
        feelsLikeTemp: day.feelslike,
        highTemp: day.tempmax,
        lowTemp: day.tempmin
    }
};

function createWeekForecast(sourceArray) {
    const weekArray = [];

    for (let i = 0; i < 7; i++) {
        const dayObject = createDayObject(sourceArray[i]);
        weekArray.push(dayObject);
    };

    return weekArray;
};

function createHourObject(hour) {
    return {
        hour: hour.datetime,
        icon: hour.icon,
        temp: hour.temp
    }
};

function createHourlyForecast(sourceArray) {
    const hourArray = [];

    sourceArray.forEach((hour) => {
        const hourObject = createHourObject(hour);
        hourArray.push(hourObject);
    });

    return hourArray;
}

getWeatherData("Brantford");

// functions to display weather data in HTML
function displayCurrentDayForecast(location, weekArray, parentContainer) {
    const currentDay = weekArray[0];

    const locationHeader = document.createElement("h2");
    locationHeader.textContent = location;

    const currentTemp = document.createElement("h1");
    if (tempScale) {
        currentTemp.textContent = `${Math.round(currentDay.temp)}°C`;
    } else {
        currentTemp.textContent = `${Math.round((currentDay.temp * 1.8) + 32)}°F`;
    }

    const feelsLikeTempDiv = document.createElement("div");
    if (tempScale) {
        feelsLikeTempDiv.textContent = `Feels like: ${Math.round(currentDay.feelsLikeTemp)}°C`;
    } else {
        feelsLikeTempDiv.textContent = `Feels like: ${Math.round((currentDay.feelsLikeTemp * 1.8) + 32)}°F`;
    }

    const highLowTempDiv = document.createElement("div");
    highLowTempDiv.id = "range";

    const highTempDiv = document.createElement("div");
    if (tempScale) {
        highTempDiv.textContent = `High: ${Math.round(currentDay.highTemp)}°C`;
    } else {
        highTempDiv.textContent = `High: ${Math.round((currentDay.highTemp * 1.8) + 32)}°C`;
    }

    const lowTempDiv = document.createElement("div");
    if (tempScale) {
        lowTempDiv.textContent = `Low: ${Math.round(currentDay.lowTemp)}°C`;
    } else {
        lowTempDiv.textContent = `Low: ${Math.round((currentDay.lowTemp * 1.8) + 32)}°F`;
    }

    highLowTempDiv.append(highTempDiv, lowTempDiv);

    parentContainer.append(locationHeader, currentTemp, feelsLikeTempDiv, highLowTempDiv);
};

function displayWeeklyForecast(sourceArray, parentContainer) {
    const weekContainer = document.createElement("div");
    weekContainer.id = "week";

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    sourceArray.slice(1).forEach((day) => {
        const dayDiv = document.createElement("div");
        const currentDay = new Date(day.day);
        const dayIndex = currentDay.getDay();

        dayDiv.textContent = daysOfWeek[dayIndex];

        // const dayIconDiv = document.createElement("div");
        // const dayIconImage = day.icon;
        // dayIconDiv.appendChild(dayIconImage)

        const dayLowTempDiv = document.createElement("div");
        if (tempScale) {
            dayLowTempDiv.textContent = `Low: ${Math.round(day.lowTemp)}°C`;
        } else {
            dayLowTempDiv.textContent = `Low: ${Math.round((day.lowTemp * 1.8) + 32)}°F`;
        };

        const dayHighTempDiv = document.createElement("div");
        if (tempScale) {
            dayHighTempDiv.textContent = `High: ${Math.round(day.highTemp)}°C`;
        } else {
            dayHighTempDiv.textContent = `High: ${Math.round((day.highTemp * 1.8) + 32)}°F`;
        };

        // weekContainer.append(dayDiv, dayIconDiv, dayLowTempDiv, dayHighTempDiv);

        weekContainer.append(dayDiv, dayLowTempDiv, dayHighTempDiv)
    });

    parentContainer.appendChild(weekContainer)
};

function displayHourlyForecast(sourceArray, parentContainer) {
    const hourlyContainer = document.createElement("div");
    hourlyContainer.id = "hourly";

    sourceArray.forEach((hour) => {

        const hourContainer = document.createElement("div");
        hourContainer.className = "hour";

        const hourDiv = document.createElement("div");
        const hourText = hour.hour.slice(0, 2);

        if (hourText.startsWith("0")) {
            hourText.slice(1, 2);
        };

        const hourNumber = parseInt(hourText);

        if (hourNumber === 0) {
            hourDiv.textContent = "12:00am";
        } else if (hourNumber === 12) {
            hourDiv.textContent = "12:00pm";
        } else if (hourNumber > 11) {
            hourDiv.textContent = `${hourNumber - 12}:00pm`
        } else {
            hourDiv.textContent = `${hourNumber}:00am`
        };

        // const hourIconDiv = document.createElement("div");
        // const hourIconImage = hour.icon;
        // hourIconDiv.appendChild(hourIconImage);

        const hourTempDiv = document.createElement("div");
        if (tempScale) {
            hourTempDiv.textContent = `${Math.round(hour.temp)}°C`;
        } else {
            hourTempDiv.textContent = `${Math.round((hour.temp * 1.8) + 32)}°F`;
        };

        // hourContainer.append(hourDiv, hourIconDiv, hourTempDiv);
        hourContainer.append(hourDiv, hourTempDiv);

        hourlyContainer.appendChild(hourContainer);
    });

    parentContainer.appendChild(hourlyContainer);
};