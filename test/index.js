/**
 * [{
 *  "value": "",
 *  "time" : 00:00
 * }]
 * 
 * 
 */

$(function () {
    console.log("hello");
    $('.ControllerContainer').before('<div class="adin"></div>');
    $('.adin').css({
        "position": "relative",
        "top": 0,
        "right": 0,
        "bottom": 0,
        "left": 0,
        "height": "50px"
    });

    let api = $('#js-initial-watch-data').attr('data-api-data');
    let api_j = JSON.parse(api);
    console.log(api_j);
    console.log(api_j["commentComposite"]);
});