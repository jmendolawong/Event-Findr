'use strict'

const tm_api = 'eAd63TkQc0q3l9HRSC8sAeztaCS3XKUg'
const tm_url = 'https://app.ticketmaster.com/discovery/v2/events.json'
const w_api = 'b4d04345bca045fe9ed144628181312'
const w_url = 'https://api.apixu.com/v1/current.json?'



/*
Take object parameters and format into a url digestible string for queries
Iterate over using keys to create an array, combine into another array with the correct format
Join array into one string
*/
function formatParams(param){

    const queryString = Object.keys(param)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(param[key])}`);
    return queryString.join("&");
}

//Takes the parameters latitude, longitude
//Stuffs it into appropriate weather api string
function formatWeatherParam(lat, long){
    return `${w_url}key=${w_api}&q=${lat},${long}`;
}


//If date is today, then current weather
//if date is later and less than 11 days away, then forecast
//if date is >10 days away, then return message 
function getWeather(url, date){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); 
    let yyyy = today.getFullYear();
    today = yyyy+'-'+mm+'-'+dd;
    console.log(today);
    console.log(date);

    //Is date today?
    if(today == date){
        fetch(url)
        .then(response => {
            if(response.ok){
                return response.json();
            } throw new Error(response.statusText);
        }).then(responseJSON => {
            $('#results-weather').append(
                `<li>${responseJSON.current.condition.text},
                Temp: ${responseJSON.current.temp_f}&#8457
                </li>`
            )    
        })
        .catch(error =>{
            console.log(`Error: ${error.message}`);
        })
    } else {
        $('#results-weather').append(
            `<li>No weather to report
            </li>`
        )    
    
    /* Take out this logic until a more robust forecast solution
    fetch(url)
        .then(response => {
            if(response.ok){
                return response.json();
            } throw new Error(response.statusText);
        }).then(responseJSON => {
            $('#results-weather').append(
                `<li>No weather to report
                </li>`
            )    
        })
        .catch(error =>{
            console.log(`Error: ${error.message}`);
        })
    */
    }
}

/*
This function emptys out the #results-list if refreshed through multiple queries
Appends results to #results-list.
Pulls the latitude and longitude and plugs them into the weather API
*/
function displayResults(results){
    $('#results-list').empty();
    $('#results-weather').empty();

    let bitly, lat, long, date, url= '';

    for(let i=0; i<results.page.size; i++){
        bitly = results._embedded.events[i];
        date = bitly.dates.start.localDate;

        if($('#add-weather').prop('checked')){
            lat = bitly._embedded.venues[0].location.latitude;
            long = bitly._embedded.venues[0].location.longitude;
            getWeather(formatWeatherParam(lat, long), date);
        }


        $('#results-list').append(
            `<li>
            <p><strong>${bitly.name}<strong>: <a href='${bitly.url}'>Buy tickets</a></p>
            <p>${date}</p>
            
            `
        )
    }

    $('.results').removeClass('hidden');
   

}


/*
User inputs search parameters
Format those params into digestible ticketmaster api compability.
Pull out useful information from the json response, clean it up and html it
Then possibly search for weather during that event

Filter by: keyword, city, stateCode, postalCode
*/
function getEvent(word, size=10){
    //argument is the value inputted by user
    const params = {
        apikey: tm_api,
        size
    };

    //Pulls text from user selected key
    let queryKey = $('#search-options option:selected').text().toLowerCase();
    //Accounts for variations of States input
    if(queryKey == 'state'){
        queryKey += 'Code';
        if(word.length > 2){
            word = Object.keys(states).find(key => states[key].toLowerCase() == word.toLowerCase());
        }
    } else if (queryKey == 'zip code'){
        queryKey = 'postalCode';
    }

    //adds additional query parameter to object
    params[queryKey] = word;

    //formats into a url digestible string
    const queryString = formatParams(params);

    //adds all components together for api digestible url
    const url = tm_url+"?"+queryString+"&sort=date,asc";

    console.log(url);
    fetch(url)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error (response.statusText);
        })
        .then(responseJSON => {console.log(responseJSON); displayResults(responseJSON);})
        .catch(error => console.log('Error: '+error.message))
}


/*
-preventDefault
-listen for form submission
-change input to text or number and possible placeholders based on select value
*/
function watchForm() {
    $('form').submit(e => {
        e.preventDefault();
        const query = $('#search-word').val();
        const limit = $('#max-results').val();
        //const queryNum = $('#search-num').val();
        getEvent(query, limit);
    });
}

$(watchForm);