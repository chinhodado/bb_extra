// ==UserScript==
// @name         bb_extra
// @version      0.1
// @description  Display extra information in the Blood Brothers wikia familiar pages
// @include      http://bloodbrothersgame.wikia.com/wiki/*
// @copyright    2014, Chin
// @run-at       document-end
// ==/UserScript==
 
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
 
function addTotalPEStats() {
    var table = document.getElementsByClassName("article-table");
    var rowPE = ((table[0].getElementsByTagName("tbody"))[0].getElementsByTagName("tr"))[3];
     
    var hpPE  = parseInt((rowPE.getElementsByTagName("td"))[1].childNodes[0].nodeValue.replace(/,/g, ""));
    var atkPE = parseInt((rowPE.getElementsByTagName("td"))[2].childNodes[0].nodeValue.replace(/,/g, ""));
    var defPE = parseInt((rowPE.getElementsByTagName("td"))[3].childNodes[0].nodeValue.replace(/,/g, ""));
    var wisPE = parseInt((rowPE.getElementsByTagName("td"))[4].childNodes[0].nodeValue.replace(/,/g, ""));
    var agiPE = parseInt((rowPE.getElementsByTagName("td"))[5].childNodes[0].nodeValue.replace(/,/g, ""));
     
    var totalPE = hpPE + atkPE + defPE + wisPE + agiPE;
    var totalPEText = isNaN(totalPE)? "N/A" : numberWithCommas(totalPE);
     
    var newText = "<tr><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Total PE stats'><a>Total</a></span></td><td></td><td></td><td></td><td></td><td>" + totalPEText + "</td></tr>";
     
    // add the new row to tbody
    (table[0].getElementsByTagName("tbody"))[0].innerHTML += newText;

    // or add it directly to the PE row, but can cause overflow in small screens
    //var addedPETotalText = "<td>" + numberWithCommas(totalPE) + "</td>";
    //rowPE.innerHTML += addedPETotalText;
}


function getPVPTierInfo () {

    // fetch the PVP tier list
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/wiki/Familiar_Tier_List/PvP", false);
    xmlhttp.send();

    // parse the response text into DOM
    var doc = document.implementation.createHTMLDocument("PVPTier");
    doc.documentElement.innerHTML = xmlhttp.responseText;
    var tables = doc.getElementsByClassName("wikitable");

    var found = false;
    var tierResult = "N/A";
    var tiers = ['X', 'S+', 'S', 'A+', 'A', 'B', 'C', 'D', 'E'];
    var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML;

    for (var i = 0; i < 9 && found == false; i++){ // 9 tables
        var items = tables[i].getElementsByTagName("*");
        for (var j = 0; j < items.length; j++) {
            if (items[j].innerHTML == famName) {
                found = true;
                tierResult = tiers[i];
                break;
            }
        }
    }
    return tierResult;
}

function getRaidTierInfo () {

    // fetch the raid tier list
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/wiki/Familiar_Tier_List/Raid", false);
    xmlhttp.send();

    // parse the response text into DOM
    var doc = document.implementation.createHTMLDocument("RaidTier");
    doc.documentElement.innerHTML = xmlhttp.responseText;
    var tables = doc.getElementsByClassName("wikitable");

    var found = false;
    var tierResult = "N/A";
    var tiers = ['X', 'S+', 'S', 'A+', 'A', 'B', 'C', 'D', 'E'];
    var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML;

    for (var i = 0; i < 9 && found == false; i++){ // 9 tables
        var items = tables[i].getElementsByTagName("*");
        for (var j = 0; j < items.length; j++) {
            if (items[j].innerHTML == famName) {
                found = true;
                tierResult = tiers[i];
                break;
            }
        }
    }
    return tierResult;
}

function getTowerTierInfo () {

    // fetch the tower tier list
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/wiki/Familiar_Tier_List/Tower", false);
    xmlhttp.send();

    // parse the response text into DOM
    var doc = document.implementation.createHTMLDocument("TowerTier");
    doc.documentElement.innerHTML = xmlhttp.responseText;
    var tables = doc.getElementsByClassName("wikitable");

    var found = false;
    var tierResult = "N/A";
    var tiers = ['X', 'S+', 'S', 'A+', 'A', 'B', 'C', 'D', 'E'];
    var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML;

    for (var i = 0; i < 9 && found == false; i++){ // 9 tables
        var items = tables[i].getElementsByTagName("*");
        for (var j = 0; j < items.length; j++) {
            if (items[j].innerHTML == famName) {
                found = true;
                tierResult = tiers[i];
                break;
            }
        }
    }
    return tierResult;
}

function addTierInfo () {
    var table = (document.getElementsByClassName("article-table"))[0];

    var newText = "<tr>" + 
            "<td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='PVP tier'><a>PVP</a></span></td><td>" + getPVPTierInfo() + "</td><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Raid tier'><a>Raid</a></span></td><td>" + getRaidTierInfo() + "</td><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Tower tier'><a>Tower</a></span></td><td>" + getTowerTierInfo() + "</td></tr>";
     
    // add the new row to tbody
    (table.getElementsByTagName("tbody"))[0].innerHTML += newText;
}

addTotalPEStats();
addTierInfo();