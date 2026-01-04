// if tempScale is true, then temperature readouts will be in Celsius, Fahrenheit if false
var tempScale = true;

var locationValue = undefined;
var weekForecast = [];
var hourlyForecast = [];

const container = document.getElementById("container");

const form = document.getElementById("form");
const submit = document.getElementById("submit");
const input = document.getElementById("location");
const celsius = document.getElementById("C");
const fahrenheit = document.getElementById("F");

submit.addEventListener("click", async (e) => {
    // prevents regular form submission
    e.preventDefault();

    // checks if input field is empty
    if (input.value === "") {
        input.setCustomValidity("Please input a location");
        input.reportValidity();
    } else {
        input.setCustomValidity("");

        // sets location value to user input, capitalizes the first letter for appearance
        locationValue = (input.value).charAt(0).toUpperCase() + (input.value).slice(1);

        try {
            const data = await getWeatherData(locationValue);

            // sets arrays for the forecasts to the appropriate array objects from the fetch data
            weekForecast = createWeekForecast(data.days);
            hourlyForecast = createHourlyForecast(data.days[0].hours);

            // resets the container HTML and displays it if it is hidden (default page load)
            container.innerHTML = "";
            container.style.display = "flex";

            // displays appropriate values from the array objects fetched from the API
            displayCurrentDayForecast(locationValue, weekForecast, container);
            displayWeeklyForecast(weekForecast, container);
            displayHourlyForecast(hourlyForecast, container);

            // resets the form for any additional inputs
            form.reset();

        // if the fetch returns an error it will log a custom error to the input
        } catch (error) {
            input.setCustomValidity("Location could not be found, please try again");
            input.reportValidity();
        }
    };
});

// changes the scale to celsius. If the data is already displayed it will re-display using celsius
celsius.addEventListener("change", () => {
    tempScale = true;

    if (container.innerHTML !== "") {
        container.innerHTML = "";
        displayCurrentDayForecast(locationValue, weekForecast, container);
        displayWeeklyForecast(weekForecast, container);
        displayHourlyForecast(hourlyForecast, container);
    };
});

// changes the scale to fahrenheit. If the data is already displayed it will re-display using fahrenheit
fahrenheit.addEventListener("change", () => {
    tempScale = false;

    if (container.innerHTML !== "") {
        container.innerHTML = "";
        displayCurrentDayForecast(locationValue, weekForecast, container);
        displayWeeklyForecast(weekForecast, container);
        displayHourlyForecast(hourlyForecast, container);
    };
});

// async function that fetches location weather data from virtual crossing with a user input location, returns an error if it can't find the location
async function getWeatherData(location) {
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=GCACYYDMAQGHRW9LEL4NCZSRJ`)
        
        if (!response.ok) {
            return new Error("error")
        }

        const data = await response.json();
        return data;

    } catch (error) {
        return new Error("error");
    }
};

// creates a day object with all relevant details
function createDayObject(day) {
    return {
        day: day.datetime,
        icon: day.icon,
        description: day.description,
        temp: day.temp,
        feelsLikeTemp: day.feelslike,
        highTemp: day.tempmax,
        lowTemp: day.tempmin
    }
};

// creates an array of seven day objects to be displayed later
function createWeekForecast(sourceArray) {
    const weekArray = [];

    for (let i = 0; i < 7; i++) {
        const dayObject = createDayObject(sourceArray[i]);
        weekArray.push(dayObject);
    };

    return weekArray;
};

// creates an hour object with all relevant details
function createHourObject(hour) {
    return {
        hour: hour.datetime,
        icon: hour.icon,
        temp: hour.temp
    }
};

// creates an array of hour objects for the current day to be displayed later
function createHourlyForecast(sourceArray) {
    const hourArray = [];

    sourceArray.forEach((hour) => {
        const hourObject = createHourObject(hour);
        hourArray.push(hourObject);
    });

    return hourArray;
}

// function to display current day weather data in HTML
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

    const descriptionDiv = document.createElement("div");
    descriptionDiv.textContent = currentDay.description;

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

    parentContainer.append(locationHeader, currentTemp, feelsLikeTempDiv, descriptionDiv, highLowTempDiv);
};

// function to display weekly forecast weather data in HTML
function displayWeeklyForecast(sourceArray, parentContainer) {
    const weekContainer = document.createElement("div");
    weekContainer.id = "week";

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    sourceArray.slice(1).forEach((day) => {
        const dayDiv = document.createElement("div");
        const currentDay = new Date(day.day);
        const dayIndex = currentDay.getDay();

        dayDiv.textContent = daysOfWeek[dayIndex];

        const dayIconDiv = document.createElement("div");
        const dayIconImage = document.createElement("img");
        dayIconImage.src = `./images/${day.icon}.png`;
        dayIconDiv.appendChild(dayIconImage);

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

        weekContainer.append(dayDiv, dayIconDiv, dayLowTempDiv, dayHighTempDiv)
    });

    parentContainer.appendChild(weekContainer)
};

// function to display hourly forecast weather data in HTML
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

        const hourIconDiv = document.createElement("div");
        const hourIconImage = document.createElement("img");
        hourIconImage.src = `./images/${hour.icon}.png`;
        hourIconDiv.appendChild(hourIconImage);

        const hourTempDiv = document.createElement("div");
        if (tempScale) {
            hourTempDiv.textContent = `${Math.round(hour.temp)}°C`;
        } else {
            hourTempDiv.textContent = `${Math.round((hour.temp * 1.8) + 32)}°F`;
        };

        hourContainer.append(hourDiv, hourIconDiv, hourTempDiv);

        hourlyContainer.appendChild(hourContainer);
    });

    parentContainer.appendChild(hourlyContainer);
};