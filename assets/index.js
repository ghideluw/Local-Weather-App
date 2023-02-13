var Apikey = "a0ea4d1d384891c16e27a0589c3d97de";

var city = $('#city-search');
var searchBtn = $('#search-btn');
var clearBtn = $('#clear-btn');
var pastSearches = $('#past-searches');

// create function to use Open Weather 'One Call API' to get weather from different cities
function getWeather(data) {
//create variable for requesting data from the API
    var requestUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${Apikey}&lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            showCurrentDate(data)
    
            var uv = data.list[0].uvi;
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

            // currentConditions.append(uvElem);

            // display the 5 - Day Forecast using h2 header
    
            var weeklyForecastHeader = $('#weeklyForecastHeader');
            var fiveDayHeader = $('<h2>');
            fiveDayHeader.text('5-Day Forecast:');
            weeklyForecastHeader.append(fiveDayHeader);

            var fiveDayForecast = $('#fiveDayForecast');
            fiveDayForecast.html("");

            // retrieve the weather data for five day forecast 
            //(temp, wind, humididty, date) and display 
            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.list[i].dt;
                date = moment.unix(date).format("MM/DD/YYYY");

                temp = data.list[i].main.temp;
                icon = data.list[i].weather[0].icon;
                wind = data.list[i].wind.speed;
                humidity = data.list[i].main.humidity;

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

    searches.innerHTML ='';

    for (i = 0; i < searchedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-secondary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${searchedCities[i].city}`;
        pastCityBtn.addEventListener('click', function(event){
            event.preventDefault()
            let cityName = event.target.innerHTML;
            getCoordinates(cityName)
        })
        searches.appendChild(pastCityBtn);
    }
    return;
}

// retrieve the  city coordinates and use them in the one call api to get weather data
function getCoordinates (currentCity) {
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
        console.log(storedCities);

        let filteredCities = storedCities.filter(city => city.city.toLowerCase() === currentCity.toLowerCase());
        if (filteredCities.length === 0){
            storedCities.push(coordinateInfo);
            localStorage.setItem("cities", JSON.stringify(storedCities));
        }

        

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
    var pastSearches = document.getElementById('prev-searches');

    localStorage.removeItem("cities");
    pastSearches.innerHTML ='';

    return;
}

function clearWeatherData () {
    var currentConditions = document.getElementById("currentConditions");
    currentConditions.innerHTML = '';

    var forecastHeader = document.getElementById("forecastHeader");
    forecastHeader.innerHTML = '';

    var fiveDayForecast = document.getElementById("fiveDayForecast");
    fiveDayForecast.innerHTML = '';

    return;
}

// this function will submit city name and be used  to getCoordinates function
function handleFormSubmit (event) {
    event.preventDefault();
    let currentCity = city.val().trim();

    clearWeatherData();
    getCoordinates(currentCity);

    return;
}

// this function will update previously searched cities weather data when reclicked

function prevCity (event) {
    var element = event.target;

    if (element.matches(".prev-city")) {
       let currentCity = element.textContent;
        
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
function showCurrentDate(data) {
    $("#currentConditons").html("")
    var cityWeatherIcon = data.list[0].weather[0].icon;
    var currentDate = data.list[0].dt;
    var formattedDate = moment.unix(currentDate).format("MM/DD/YYYY");
    var currentDateHTML = `
    <h2>${formattedDate}<img src="http://openweathermap.org/img/wn/${cityWeatherIcon}.png"></h2>
    <p>Temp: ${data.list[0].main.temp}</p>
    <p>Wind: ${data.list[0].wind.speed}</p>
    <p>Humidity: ${data.list[0].main.humidity}</p>
    `
    $("#currentConditions").html(currentDateHTML);
}
displaySearchHistory();

searchBtn.on("click", handleFormSubmit);

clearBtn.on("click", clearHistory);

pastSearches.on("click", prevCity);