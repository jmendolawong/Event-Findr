'use strict'

const tm_api = 'eAd63TkQc0q3l9HRSC8sAeztaCS3XKUg'
const tm_url = 'https://app.ticketmaster.com/discovery/v2/events.json'
const w_api = 'b4d04345bca045fe9ed144628181312'
const w_url = 'http://api.apixu.com/v1'



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



function displayResults(results){
    $('#results-list').empty();

    $('#user-choice').text(query);
    console.log(results._embedded.events[0].name);
    for(let i=0; i<results.page.size; i++){
        let bitly = results._embedded.events[i];
        $('#results-list').append(
            `<li><h2>${bitly.name}</h2>
            <p>${bitly.dates.start.localDate}</p>
            
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
    const url = tm_url+"?"+queryString;

    console.log(url);
    fetch(url)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error (response.statusText);
        })
        .then(responseJSON => {console.log(responseJSON);displayResults(responseJSON);})
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