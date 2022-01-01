// Variabler
const body = document.querySelector('body');
const h1 = document.querySelector('h1');
const label = document.querySelector('label');
const apiKey = `8828fd07fb194c9697f897024cc88a35`;
const submitBtn = document.getElementById('submit-button');
let currentForecast = document.getElementById('current-forecast');
let fiveDaysHeader = document.getElementById('fiveday-header');
let fiveDaysForecast = document.getElementById('fiveday-forecast');
let cityInput = document.getElementById('city');
let errorMessage = document.getElementById('error-message');

// Bakgrunden för hela sidan ändras beroende på tid på dygnet. Dagsmodus visar ljus bakgrund och nattmodus visas i form av en bild med mörkt tema 
// Text-färg på vissa element ändras från svart till vit i nattmodus för mer tydlighet
let currentTime = new Date().getHours();
if (body) {
    if (8 <= currentTime && currentTime < 20) {
        body.style.background = 'linear-gradient(to bottom left, rgba(232, 236, 241) 50%, rgba(236, 240, 241) 50%)';
    }
    else {
        body.style.backgroundImage = 'url("./img/night.jpg")';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundSize = 'cover';
        h1.style.color = '#FFFFFF';
        label.style.color = '#FFFFFF';
        currentForecast.style.color = '#FFFFFF';
    }
}

// Anropar alla funktioner som ska hända när användaren klickar på submit-knappen
submitBtn.addEventListener('click', searchCity);

function searchCity(event) {
    event.preventDefault();

    const searchCity = cityInput.value;
    const currentUrl = currentWeatherUrl(searchCity);
    const searchUrl = fiveDaysUrl(searchCity);
    removeSearch();
    getCurrentWeather(currentUrl);
    getFiveDaysWeather(searchUrl);
    resetMessage();
    animation.play();

};

// Skapar en url och en funktion som visar nuvarande väder
function currentWeatherUrl(city) {
    return `https://api.weatherbit.io/v2.0/current?key=${apiKey}&city=${city}&lang=sv&include=minutely`;
}

function getCurrentWeather(currentUrl) {

    fetch(currentUrl).then(
        function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                throw "Something went wrong here."
            }
        }

    ).then(
        function (data) { // Här skapas elementen som visas för nuvarande väder

            let currentDay = document.createElement('div');
            currentForecast.appendChild(currentDay);

            const h2 = document.createElement('h2');
            currentDay.append(h2);
            h2.innerText = data.data[0].city_name + ',' + ' ' + data.data[0].country_code;

            const img = document.createElement('img');
            currentDay.append(img);
            let icon = data.data[0].weather.icon;
            img.src = `https://www.weatherbit.io/static/img/icons/${icon}.png`;

            const p = document.createElement('p');
            currentDay.append(p);
            p.innerText = 'Temperaturen är just nu' + ' ' + data.data[0].temp + ' ' + '°C';

            const p1 = document.createElement('p');
            currentDay.append(p1);
            p1.innerText = 'Det är' + ' ' + data.data[0].weather.description;

            const p2 = document.createElement('p');
            currentDay.append(p2);
            p2.innerText = 'Luftfuktighet:' + ' ' + data.data[0].rh + '%' + ' ' + ' | ' + ' ' + 'Vindhastighet:' + ' ' + data.data[0].wind_spd + ' ' + 'm/s';

            const p3 = document.createElement('p');
            currentDay.append(p3)
            p3.innerText = 'Soluppgång kl:' + ' ' + data.data[0].sunrise + ' ' + '(UTC)' + ' | ' + ' ' + 'Solnedgång kl:' + ' ' + data.data[0].sunset + ' ' + '(UTC)';
        }

    ).catch(
        function (error) {
            setErrorMessage();

        }
    )
}

// Skapar en url och en funktion som hämtar väder för 5 dagar framåt
function fiveDaysUrl(city) {
    return `https://api.weatherbit.io/v2.0/forecast/daily?&lat=38.123&lon=-78.543&city=${city}&key=${apiKey}&lang=sv&days=6`;
}

function getFiveDaysWeather(fiveDaysUrl) {
    fetch(fiveDaysUrl).then(
        function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                throw "There seems to be an error."
            }
        }
    ).then(
        function (data) {
            get5DaysWeather(data)
        }).catch(
            function (error) {
                setErrorMessage();
            }
        )
}

function get5DaysWeather(data) {

    fiveDaysHeader.innerText = 'Prognos för kommande fem dagar i' + ' ' + data.city_name + ' ' + '⤵️';
    // Skapar en array av alla veckodagar och byter ut värdet i datum till dagens namn under variabeln "par"
    const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];

    for (let i = 1; i < data.data.length; i++) { // Skapar element och loopar igenom fem gånger för att visa vädret för kommande dagar

        let forecastParent = document.createElement('div');
        fiveDaysForecast.appendChild(forecastParent);

        const par = document.createElement('p');
        forecastParent.appendChild(par);
        let date = new Date(data.data[i].datetime);
        let day = weekdays[date.getDay()];
        par.innerText = day;
        par.style.color = '#F23D3D';

        const par1 = document.createElement('p');
        forecastParent.appendChild(par1);
        par1.innerText = data.data[i].weather.description;

        const img1 = document.createElement('img');
        forecastParent.appendChild(img1);
        let icon1 = data.data[i].weather.icon;
        img1.src = `https://www.weatherbit.io/static/img/icons/${icon1}.png`;

        const par2 = document.createElement('p');
        forecastParent.appendChild(par2);
        par2.innerText = data.data[i].temp + '°';
        par2.style.fontSize = '1.5rem';

    }
}

// Funktion som visar meddelande till användaren när stad ej hittas/något är fel med servern
function setErrorMessage() {
    currentForecast.style.display = 'none';
    fiveDaysForecast.style.display = 'none';
    fiveDaysHeader.style.display = 'none';
    errorMessage.innerText = 'Did you spell your city right? The problem might also be the server. If so, please return to our website in a bit. Thank you for your patience!';
}

// Tar bort allt som inte längre ska visas när vi söker på något nytt efter att fel-meddelande har visats
function resetMessage() {
    errorMessage.innerText = '';
    currentForecast.style.display = '';
    fiveDaysForecast.style.display = '';
    fiveDaysHeader.style.display = '';
}

// Funktion som tar bort föregående sök
function removeSearch() {
    const divFor = document.querySelectorAll('#current-forecast div');
    for (let i = 0; i < divFor.length; i++) {
        const el1 = divFor[i];
        el1.remove();

    }

    {
        const divEl = document.querySelectorAll('#fiveday-forecast div');
        for (let i = 0; i < divEl.length; i++) {
            const el = divEl[i];
            el.remove();
        }
    }
}

// Animation som visas på rubriken till vädret för de kommande fem dagarna. Det valda JS-biblioteket är Anime JS 
const animation = anime({
    targets: fiveDaysHeader,
    loop: true,
    scale: 0.9,
    duration: 4000,
    color: '#3e6af0'
})
