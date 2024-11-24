"use strict";
window.onload = init;
let displayTerm = "";

function init() {
    // call functions to display options
    getAmiiboType();
    getAmiiboSeries();
    getGameSeries();
    document.querySelector("#search").onclick = getData;

    // setting up local storage key
    const searchField = document.querySelector("#searchterm");
    const prefix = "dlm4695-";
    const termKey = prefix + "name";

    const storedTerm = localStorage.getItem(termKey);

    // sets a default local last search character
    if (storedTerm) {
        searchField.value = storedTerm;
    }
    else {
        searchField.value = "mario";
    }

    searchField.onchange = (e) => {
        localStorage.setItem(termKey, e.target.value);
    };
}

function getAmiiboType() {
    // create a new XHR object
    let xhr = new XMLHttpRequest();

    // set the onload handler
    xhr.onload = (e) => {
        let options = '<option value="default" selected>Any</option>';
        let obj = JSON.parse(xhr.responseText);
        let results = obj.amiibo;
        for (const element of results) {
            options += `<option value="${element.name}">${element.name}</option>`
        }
        document.querySelector("#amiiboType").innerHTML = options;
    }

    // open connection and send the request
    xhr.open("GET", "https://www.amiiboapi.com/api/type/");
    xhr.send();
}

function getAmiiboSeries() {
    // create a new XHR object
    let xhr = new XMLHttpRequest();

    // set the onload handler
    xhr.onload = (e) => {
        let options = '<option value="default" selected>Any</option>';
        let obj = JSON.parse(xhr.responseText);
        let results = obj.amiibo;
        for (const element of results) {
            options += `<option value="${element.name}">${element.name}</option>`
        }
        document.querySelector("#amiiboSeries").innerHTML = options;
    }

    // open connection and send the request
    xhr.open("GET", "https://www.amiiboapi.com/api/amiiboseries/");
    xhr.send();
}

function getGameSeries() {
    // create a new XHR object
    let xhr = new XMLHttpRequest();

    // set the onload handler
    xhr.onload = (e) => {
        let options = '<option value="default" selected>Any</option>';
        let obj = JSON.parse(xhr.responseText);
        let results = obj.amiibo;

        // set for parsing through repeated results
        let uniqueResults = new Set();

        results.forEach(item => {
            if (!uniqueResults.has(item.name)) {
                uniqueResults.add(item.name);
                options += `<option value="${item.name}">${item.name}</option>`;
            }
        });

        document.querySelector("#gameSeries").innerHTML = options;
    }

    // open connection and send the request
    xhr.open("GET", "https://www.amiiboapi.com/api/gameseries/");
    xhr.send();
}

function getData() {
    // main entry point to web service
    const SERVICE_URL = "https://www.amiiboapi.com/api/amiibo/?name=";

    // build up our URL string
    // not necessary for this service endpoint
    let url = SERVICE_URL;

    // parse the user entered term we wish to search
    // not necessary for this service endpoint
    let term = document.querySelector("#searchterm").value.trim();
    displayTerm = term;
    term = encodeURIComponent(term);
    url += term;

    // Get filter values
    let amiiboType = document.querySelector("#amiiboType").value;
    let amiiboSeries = document.querySelector("#amiiboSeries").value;
    let gameSeries = document.querySelector("#gameSeries").value;

    // Append filters only if they are not "default"
    if (amiiboType !== "default") {
        url += `&type=${encodeURIComponent(amiiboType)}`;
    }

    if (amiiboSeries !== "default") {
        url += `&amiiboSeries=${encodeURIComponent(amiiboSeries)}`;
    }

    if (gameSeries !== "default") {
        url += `&gameseries=${encodeURIComponent(gameSeries)}`;
    }

    // update the UI
    document.querySelector("#status").innerHTML = "<p>Searching for '" + displayTerm + "'</p>"

    // create a new XHR object
    let xhr = new XMLHttpRequest();

    // set the onload handler
    xhr.onload = dataLoaded;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    // e.target is the xhr object
    let xhr = e.target;

    // turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    if (!obj.amiibo || obj.amiibo.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'<b>";
        document.querySelector("#content").innerHTML = "";
        return; // bail out
    }

    // if there is an array of results, loop through them
    let results = obj.amiibo;
    let bigString = "";

    // iterate through results data 
    for (const element of results) {
        let result = element;

        let image = result.image;
        let character = result.character;
        let amiiboSeries = result.amiiboSeries;
        let gameSeries =result.gameSeries;

        let line = `<div id='result'>`;
        line += `<img src="${image}" title="${character}" />`;
        line += `<p>${amiiboSeries} series</p>`;
        line += `<p>${gameSeries} series</p>`;
        line += `</div>`;

        bigString += line;
    }

    // display final results to user
    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#status").innerHTML = "<p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";
}