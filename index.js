'use strict'

const ticketMasterApi = 'eAd63TkQc0q3l9HRSC8sAeztaCS3XKUg'
const ticketMasterUrl = 'https://app.ticketmaster.com/discovery/v2/events.json'
const weatherApi = 'b4d04345bca045fe9ed144628181312'
const weatherUrl = 'https://api.apixu.com/v1/current.json?'


/*
Takes the parameters latitude, longitude
Stuffs it into appropriate weather api string
*/
function formatWeatherParam(lat, long) {
    return `${weatherUrl}key=${weatherApi}&q=${lat},${long}`;
}

/*
Removes hidden class from weather if still attached
Gets weather using lat and long and puts it into HTML
*/
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
Rehides error message if last query didn't return any results
Empties out the #results-list if refreshed through multiple queries
If the date of one of the event == today
Pulls the latitude and longitude and plugs them into the weather function
Pulls event name, ticket url and date(s) of event 
Appends those results to #results-list
*/
function displayResults(results) {
    if (!$('.error').hasClass('hide')) {
        $('.error').addClass('hide');
    }

    $('#results-list').empty();

    let today = new Date(),
        dd = today.getDate(),
        mm = (today.getMonth() + 1),
        yyyy = today.getFullYear();
    let weatherDate = mm + '/' + dd;
    if(dd < 10) {
        dd = '0' + dd;
    }
    if(mm < 10) {
        mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;


    for (let i = 0; i < results.page.size; i++) {
        let bitly = results._embedded.events[i];
        let date = bitly.dates.start.localDate;

        //Is date == today?
        if (i == 0) {
            console.log(date);
            console.log(today);
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
Filter by: city or postalCode, display x results
*/
function getEvent(word, size = 10) {
    const params = {
        apikey: ticketMasterApi,
        size
    };

    let queryKey = $('#search-options option:selected').text().toLowerCase();
    if (queryKey == 'zip code') {
        queryKey = 'postalCode';
    }

    params[queryKey] = word;

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
Removes 'hide' class to the results page so the animation can scroll down
*/
function watchForm() {
    $('form').submit(e => {
        e.preventDefault();
        const query = $('#search-word').val();
        const limit = $('#max-results').val();
        getEvent(query, limit);
        $('.results-page').removeClass('hide');
        $('html, body').animate({ scrollTop: $('.results-page').offset().top })
    });
}

$(watchForm);