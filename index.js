'use strict'
/*
-preventDefault
-listen for form submission
-change input to text or number and possible placehold based on select value
-format api params


*/



function watchForm() {
    $('form').submit(e => {
        e.preventDefault();
        const queryWord = $('#search-word').val();
        const queryNum = $('#search-num').val();
    });
}

$(watchForm);