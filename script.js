// ==UserScript==
// @name         bb_extra
// @version      0.3
// @description  Display extra information in the Blood Brothers wikia familiar pages
// @include      http://bloodbrothersgame.wikia.com/wiki/*
// @copyright    2014, Chin
// @run-at       document-end
// ==/UserScript==

var displayTotalPE = true;
var displayTier    = true;
var displaySkill   = true;
var displayPOPE    = true;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addPOPEStats() {
    var category = ((document.getElementsByClassName("name"))[0].getElementsByTagName("a"))[0].childNodes[0].nodeValue;
    var toAdd;
    if (category == "Epic 4") toAdd = 667; //POPE
    else if (category == "Epic 2") toAdd = 550; //OPE100
    else if (category == "Legendary 2") toAdd = 550; //OPE100
    else if (category == "Mythic 2") toAdd = 550; //OPE100

    if (category == "Epic 4" || category == "Epic 2" || category == "Legendary 2" || category == "Mythic 2"){
        //TODO: reuse the code...
        var table = document.getElementsByClassName("article-table");
        var rowPE = ((table[0].getElementsByTagName("tbody"))[0].getElementsByTagName("tr"))[3];
         
        var hpPE  = parseInt((rowPE.getElementsByTagName("td"))[1].childNodes[0].nodeValue.replace(/,/g, ""));
        var atkPE = parseInt((rowPE.getElementsByTagName("td"))[2].childNodes[0].nodeValue.replace(/,/g, ""));
        var defPE = parseInt((rowPE.getElementsByTagName("td"))[3].childNodes[0].nodeValue.replace(/,/g, ""));
        var wisPE = parseInt((rowPE.getElementsByTagName("td"))[4].childNodes[0].nodeValue.replace(/,/g, ""));
        var agiPE = parseInt((rowPE.getElementsByTagName("td"))[5].childNodes[0].nodeValue.replace(/,/g, ""));

        //POPE stats

        var hpPOPE  = hpPE + toAdd;
        var atkPOPE = atkPE + toAdd;
        var defPOPE = defPE + toAdd;
        var wisPOPE = wisPE + toAdd;
        var agiPOPE = agiPE + toAdd;

        var newText = "<tr><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='POPE stats (OPE400 for EP4, OPE100 for EP2 and L2)'><a>POPE</a></span></td><td>"
                        + numberWithCommas(hpPOPE) + "</td><td>"
                        + numberWithCommas(atkPOPE) + "</td><td>"
                        + numberWithCommas(defPOPE) + "</td><td>"
                        + numberWithCommas(wisPOPE) + "</td><td>"
                        + numberWithCommas(agiPOPE) + "</td></tr>";
         
        // add the new row to tbody
        (table[0].getElementsByTagName("tbody"))[0].innerHTML += newText;
    }
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

function addSkillInfo () {

    // fetch the skill page
    var skillList = (((document.getElementsByClassName("infobox"))[0].getElementsByTagName("tr"))[3]).getElementsByTagName("a");

    var skillLink1 = skillList[0].getAttribute("href")
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", skillLink1, false);
    xmlhttp.send();

    // parse the response text into DOM
    var doc = document.implementation.createHTMLDocument("Skill");
    doc.documentElement.innerHTML = xmlhttp.responseText;

    // get the skill info box
    var infoBox = (doc.getElementsByClassName("infobox"))[0];

    // insert the skill box to the side
    var rightSection = document.getElementById("WikiaRail");
    rightSection.appendChild(infoBox);

    // if there's a second skill, add it too
    if (!(typeof skillList[1] === 'undefined')) {

        var skillLink2 = skillList[1].getAttribute("href")
        xmlhttp.open("GET", skillLink2, false);
        xmlhttp.send();

        // parse the response text into DOM
        doc = document.implementation.createHTMLDocument("Skill");
        doc.documentElement.innerHTML = xmlhttp.responseText;

        // get the skill info box
        infoBox = (doc.getElementsByClassName("infobox"))[0];

        // insert the skill box to the side
        rightSection.appendChild(infoBox);
    }
}

try {
    if (displayPOPE) addPOPEStats();
    if (displayTotalPE) addTotalPEStats();
    if (displayTier) addTierInfo();
    if (displaySkill) addSkillInfo();
}
catch (err) {
    console.log("bb_extra error: probably not a fam page");
}