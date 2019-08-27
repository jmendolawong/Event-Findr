'use strict'

const ticketMasterApi = 'eAd63TkQc0q3l9HRSC8sAeztaCS3XKUg'
const ticketMasterUrl = 'https://app.ticketmaster.com/discovery/v2/events.json'
const weatherApi = 'b4d04345bca045fe9ed144628181312'
const weatherUrl = 'https://api.apixu.com/v1/current.json?'


//Takes the parameters latitude, longitude
//Stuffs it into appropriate weather api string
function formatWeatherParam(lat, long) {
    return `${weatherUrl}key=${weatherApi}&q=${lat},${long}`;
}



//If date is today, then current weather
//if date is later and less than 11 days away, then forecast
//if date is >10 days away, then return message 
//tolocaledate
function getWeather(url, today) {
    console.log(url);
    if ($('.weather').hasClass('hidden')) {
        $('.weather').removeClass('hidden');
    }
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusCode);
        })
        .then(responseJSON => {
            $('#date').html(today);
            $('#forecast').html(responseJSON.current.condition.text);
            $('#icon').attr('src', responseJSON.current.condition.icon);
            $('#temperature').html(`Temp: ${responseJSON.current.temp_f}&#8457`);
        })
        .catch(error => {
            console.log(`Weather Error: ${error.message}`);
        })
}



/*
This function empties out the #results-list if refreshed through multiple queries
Appends results to #results-list.
Pulls the latitude and longitude and plugs them into the weather API
*/
function displayResults(results) {
    if (!$('.error').hasClass('hide')) {
        $('.error').addClass('hide');
    }

    $('#results-list').empty();
    $('#results-weather').empty();

    let today = new Date(),
        dd = today.getDate(),
        mm = ('0' + (today.getMonth() + 1)).slice(-2),
        yyyy = today.getFullYear();
    let weatherDate = mm+'/'+dd;
    today = yyyy + '-' + mm + '-' + dd;


    for (let i = 0; i < results.page.size; i++) {
        let bitly = results._embedded.events[i];
        let date = bitly.dates.start.localDate;

        //Is date == today?
        if (i == 0) {
            if (date == today || bitly.dates.end != undefined) {
                let lat = bitly._embedded.venues[0].location.latitude;
                let long = bitly._embedded.venues[0].location.longitude;
                getWeather(formatWeatherParam(lat, long), weatherDate);
            } else $('.weather').addClass('hidden');
        }
        if (bitly.dates.end != undefined) {
            date = date + ' through ' + bitly.dates.end.localDate;
        }

        $('#results-list').append(
            `<li>
            <p><strong>${bitly.name}<strong>: <a href='${bitly.url}'>Buy tickets</a></p>
            <p>${date}</p>
            <p> ---------------------- </p>
            `
        )
    }
    $('.results').removeClass('hidden');
}


/*
User inputs search parameters
Format those params into digestible ticketmaster api url.
Pull out useful information from the json response, clean it up and html it
Filter by: keyword, city, stateCode, postalCode
*/
function getEvent(word, size = 10) {
    //argument is the value inputted by user
    const params = {
        apikey: ticketMasterApi,
        size
    };

    //Pulls text from user selected key
    let queryKey = $('#search-options option:selected').text().toLowerCase();
    //let queryKeyError = queryKey;

    if (queryKey == 'zip code') {
        queryKey = 'postalCode';
    }
    params[queryKey] = word;

    //adds all components together for api digestible url
    const url = ticketMasterUrl + "?" + $.param(params) + "&sort=date,asc";

    console.log(url);
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON => { console.log(responseJSON); displayResults(responseJSON); })
        .catch(error => {
            $('.error').removeClass('hidden');
            $('#errorMessage').text(`Error: Unable to find any events. Please search a different area`);
            if (!$('.results').hasClass('hidden')) {
                $('.results').addClass('hidden');
            }
            console.log('Events Error: ' + error.message)
        })
}

/*
PreventDefault
Listen for form submission
Plug inputs into select variables and pass those into getEvent function
*/
function watchForm() {
    $('form').submit(e => {
        e.preventDefault();
        const query = $('#search-word').val();
        const limit = $('#max-results').val();
        getEvent(query, limit);
        $('.results-page').removeClass('hide');
        $('html, body').animate({ scrollTop: $('.results-page').offset().top})
    });
}

$(watchForm);