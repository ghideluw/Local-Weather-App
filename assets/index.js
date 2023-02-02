var Apikey = "a0ea4d1d384891c16e27a0589c3d97de";

var city = $('#city');
var searchBtn = $('#search-btn');
var clearBtn = $('#clear-btn');
var pastSearches = $('#past-searches');

var currentCity;

// create function to use Open Weather 'One Call API' to get weather from different cities
function getWeather(data) {
//create variable for requesting data from the API
    var requestUrl = `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={API key}&lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            // create variable to retrieve current weather conditions for a city
            var currentConditions = $('#currentConditions');
            currentConditions.addClass('border border-secondary');

            
            var cityName = $('<h2>');
            cityName.text(currentCityDate);
            currentConditions.append(cityName);
            
            // get date element and append to city name when displayed 
            var currentDate = data.current.dt;
            currentDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
            var currentDate = $('<span>');
            currentDate.text(` (${currentCityDate}) `);
            cityName.append(currentDate);

            // append weather icon to the name if the city            
            var cityWeatherIcon = data.current.weather[0].icon; // current weather icon
            var currentWeatherIcon = $('<img>');
            currentWeatherIcon.attr("src", "http://openweathermap.org/img/wn/" + cityWeatherIcon + ".png");
            cityName.append(currentWeatherIcon);

            //show the temperature info for the current city
            var cityTemperature = data.current.temp;
            var currentTemperature = $('<p>')
            currentTemperature.text(`Temp: ${cityTemperature}°C`)
            currentConditions.append(currentTemperature);
            
            //show the current wind speed for the selected city
            var currentWindSpeed = data.current.wind_speed;
            var currentWindElem = $('<p>')
            currentWindElem.text(`Wind: ${currentWindSpeed} KPH`)
            currentConditions.append(currentWindElem);

            // show the current humidity for the selected city
            var humidity = data.current.humidity;
            var currentHumidityElem = $('<p>')
            currentHumidityElem.text(`Humidity: ${humidity}%`)
            currentConditions.append(currentHumidityElem);

            // show the current UV index for the selected city, 
            //change the background color  based on uv level value 
            var uv = data.current.uvi;
            var uvElem = $('<p>');
            var uvSpanElem = $('<span>');
            uvElem.append(uvSpanElem);

            uvSpanElem.text(`UV: ${uv}`)
            
            if ( uv < 3 ) {
                uvSpanElem.css({'background-color':'green', 'color':'white'});
            } else if ( uv < 6 ) {
                uvSpanElem.css({'background-color':'yellow', 'color':'black'});
            } else if ( uv < 8 ) {
                uvSpanElem.css({'background-color':'orange', 'color':'white'});
            } else if ( uv < 11 ) {
                uvSpanElem.css({'background-color':'red', 'color':'white'});
            } else {
                uvSpanElem.css({'background-color':'violet', 'color':'white'});
            }

            currentConditions.append(uvElem);

            // display the 5 - Day Forecast using h2 header
    
            var weeklyForecastHeader = $('#weeklyForecastHeader');
            var fiveDayHeader = $('<h2>');
            fiveDayHeader.text('5-Day Forecast:');
            weeklyForecastHeader.append(fiveDayHeader);

            var fiveDayForecast = $('#fiveDayForecast');

            // retrieve the weather data for five day forecast 
            //(temp, wind, humididty, date) and display 
            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;
                date = moment.unix(date).format("MM/DD/YYYY");

                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                // display the five day forecast info in a card element
                var card = document.createElement('div');
                card.classList.add('card', 'col-2', 'm-1', 'bg-secondary', 'text-white');
                
                
                var cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.innerHTML = `<h6>${date}</h6>
                                      <img src= "http://openweathermap.org/img/wn/${icon}.png"> </><br>
                                       ${temp}deg Celsius<br>
                                       ${wind} KPH <br>
                                       ${humidity}%`
                
                card.appendChild(cardBody);
                fiveDayForecast.append(card);
            }
        })
    return;
}

// create buttons for search history list items
function displaySearchHistory() {
    var searchedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var searches = document.getElementById('prev-searches');

    pastSearches.innerHTML ='';

    for (i = 0; i < searchedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-secondary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${searchedCities[i].city}`;
        pastSearches.appendChild(pastCityBtn);
    }
    return;
}

// retrieve the  city coordinates and use them in the one call api to get weather data
function getCoordinates () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${Apikey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
 
        var coordinateInfo = {
            city: currentCity,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(coordinateInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));

        displaySearchHistory();

        return coordinateInfo;
      })
      .then(function (data) {
        getWeather(data);
      })
      return;
}

// this function is used to clear search history
function clearHistory (event) {
    event.preventDefault();
    var pastSearches = document.getElementById('past-searches');

    localStorage.removeItem("cities");
    pastSearches.innerHTML ='';

    return;
}

function clearWeatherData () {
    var currentConditions = document.getElementById("currentConditions");
    currentConditions.innerHTML = '';

    var ForecastHeader = document.getElementById("ForecastHeader");
    ForecastHeader.innerHTML = '';

    var fiveDayForecast = document.getElementById("fiveDayForecast");
    fiveDayForecast.innerHTML = '';

    return;
}

// this function will submit city name and be used  to getCoordinates function
function handleFormSubmit (event) {
    event.preventDefault();
    currentCity = city.val().trim();

    clearWeatherData();
    getCoordinates();

    return;
}

// this function will update previously searched cities weather data when reclicked

function prevCity (event) {
    var element = event.target;

    if (element.matches(".prev-city")) {
        currentCity = element.textContent;
        
        clearWeatherData();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${Apikey}`;
        
        fetch(requestUrl)
          .then(function (response) {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var coordinateInfo = {
                    city: currentCity,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return coordinateInfo;
            })
           .then(function (data) {
                getWeather(data);
        })
    }
    return;
}

displaySearchHistory();

searchBtn.on("click", handleFormSubmit);

clearBtn.on("click", clearHistory);

pastSearches.on("click", prevCity);