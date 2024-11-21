"use strict";
window.onload = init;
let displayTerm = "";

function init() {
    document.querySelector("#search").onclick = getData;
}

function getData() {
    // 1 - main entry point to web service
    const SERVICE_URL = "https://www.amiiboapi.com/api/amiibo/?name=";

    // No API Key required!

    // 2 - build up our URL string
    // not necessary for this service endpoint
    let url = SERVICE_URL;

    // 3 - parse the user entered term we wish to search
    // not necessary for this service endpoint
    let term = document.querySelector("#searchterm").value.trim();
    displayTerm = term;
    term = encodeURIComponent(term);
    url += term;

    let type = document.querySelector("#type").value;
    url += "&type=" + type;
    console.log("Here is the url: " + url);

    // let gameSeries = document.querySelector("#gameSeries").value;
    // url += "&gameseries=" + gameSeries;
    // console.log("Here is the url: " + url);

    // 4 - update the UI
    document.querySelector("#debug").innerHTML = `<b>Querying web service with:</b> <a href="${url}" target="_blank">${url}</a>`;

    // 5 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 6 - set the onload handler
    xhr.onload = dataLoaded;

    // 7 - set the onerror handler
    xhr.onerror = dataError;

    // 8 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function dataError(e) {
    console.log("An error occurred");
}

function dataLoaded(e) {
    // 1 - e.target is the xhr object
    let xhr = e.target;

    // 2 - xhr.responseText is the JSON file we just downloaded
    console.log(xhr.responseText);

    // 3 - turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    if (!obj.amiibo || obj.amiibo.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'<b>";
        return; // bail out
    }

    // 4 - if there is an array of results, loop through them
    let results = obj.amiibo;
    console.log("results.length = " + results.length);
    let bigString = "";

    // iterate through results 
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        let image = result.image;
        let character = result.character;
        let amiiboSeries = result.amiiboSeries;
        let type = result.type;

        let line = `<div id='result'>`;
        line += `<img src="${image}" title="${character}" />`;
        line += `<p>${amiiboSeries} series</p>`
        line += `</div>`;

        bigString += line;
    }

    // 5 - display final results to user
    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#status").innerHTML = "<p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";
}