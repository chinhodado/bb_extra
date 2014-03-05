// ==UserScript==
// @name         bb_extra
// @version      0.5
// @description  Display extra information in the Blood Brothers wikia familiar pages
// @include      http://bloodbrothersgame.wikia.com/wiki/*
// @copyright    2014, Chin
// @run-at       document-end
// @grant       none
// ==/UserScript==

/////////////////////////////////////////////////////////////////////////////////////
// Preference section
// Change to false if you don't want something to be displayed
/////////////////////////////////////////////////////////////////////////////////////

var displayTotalPE     = true;
var displayTotalPOPE   = true;
var displayTier        = true;
var displaySkill       = true;
var displayPOPE        = true;


/////////////////////////////////////////////////////////////////////////////////////
// Code section
/////////////////////////////////////////////////////////////////////////////////////

var data = {
    hpPE:    0,
    atkPE:   0,
    defPE:   0,
    wisPE:   0,
    agiPE:   0,
    hpPOPE:  0,
    atkPOPE: 0,
    defPOPE: 0,
    wisPOPE: 0,
    agiPOPE: 0,
    category: "",
    statTable: ""
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getStats () {
    data.statTable = document.getElementsByClassName("article-table");
    var rowPE = ((data.statTable[0].getElementsByTagName("tbody"))[0].getElementsByTagName("tr"))[3];
    
    //PE stats
    data.hpPE  = parseInt((rowPE.getElementsByTagName("td"))[1].childNodes[0].nodeValue.replace(/,/g, ""));
    data.atkPE = parseInt((rowPE.getElementsByTagName("td"))[2].childNodes[0].nodeValue.replace(/,/g, ""));
    data.defPE = parseInt((rowPE.getElementsByTagName("td"))[3].childNodes[0].nodeValue.replace(/,/g, ""));
    data.wisPE = parseInt((rowPE.getElementsByTagName("td"))[4].childNodes[0].nodeValue.replace(/,/g, ""));
    data.agiPE = parseInt((rowPE.getElementsByTagName("td"))[5].childNodes[0].nodeValue.replace(/,/g, ""));

    data.category = ((document.getElementsByClassName("name"))[0].getElementsByTagName("a"))[0].childNodes[0].nodeValue;
    var toAdd;
    if (data.category == "Epic 4") toAdd = 666;           // POPE EP4
    else if (data.category == "Epic 2") toAdd = 550;      // POPE EP2
    else if (data.category == "Legendary 2") toAdd = 550; // POPE L2
    else if (data.category == "Legendary 3") toAdd = 605; // POPE L3
    else if (data.category == "Mythic 2") toAdd = 550;    // POPE M2

    //POPE stats
    data.hpPOPE  = data.hpPE + toAdd;
    data.atkPOPE = data.atkPE + toAdd;
    data.defPOPE = data.defPE + toAdd;
    data.wisPOPE = data.wisPE + toAdd;
    data.agiPOPE = data.agiPE + toAdd;
}

function addPOPEStats() {

    if (data.category == "Epic 4" || 
        data.category == "Epic 2" || 
        data.category == "Legendary 2" || 
        data.category == "Legendary 3" || 
        data.category == "Mythic 2"  ){

        var newText = "<tr><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='POPE stats (OPE400 for EP4, OPE100 for EP2, L2, L3 and M2)'><a>POPE</a></span></td><td>"
                        + numberWithCommas(data.hpPOPE) + "</td><td>"
                        + numberWithCommas(data.atkPOPE) + "</td><td>"
                        + numberWithCommas(data.defPOPE) + "</td><td>"
                        + numberWithCommas(data.wisPOPE) + "</td><td>"
                        + numberWithCommas(data.agiPOPE) + "</td></tr>";
         
        // add the new row to tbody
        (data.statTable[0].getElementsByTagName("tbody"))[0].innerHTML += newText;
    }
}
 
function addTotalStats() {
     
    var totalPE = data.hpPE + data.atkPE + data.defPE + data.wisPE + data.agiPE;
    var totalPEText = isNaN(totalPE)? "N/A" : numberWithCommas(totalPE);

    var totalPOPE = data.hpPOPE + data.atkPOPE + data.defPOPE + data.wisPOPE + data.agiPOPE;
    var totalPOPEText = isNaN(totalPOPE)? "N/A" : numberWithCommas(totalPOPE);
    
    var newText = "";

    if (!displayTotalPOPE && displayTotalPE)
        newText = "<tr><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Total PE stats'><a>Total</a></span></td><td></td><td></td><td></td><td></td><td>" 
                  + totalPEText + "</td></tr>";
    else if (displayTotalPOPE && !displayTotalPE)
        newText = "<tr><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Total POPE stats'><a>Total</a></span></td><td></td><td></td><td></td><td></td><td>" 
                  + totalPOPEText + "</td></tr>";
    else if (displayTotalPOPE && displayTotalPE)
        newText = "<tr><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Total PE stats and total POPE stats'><a>Total</a></span></td><td></td><td></td><td></td><td>"
                  + totalPEText + "</td><td>" 
                  + totalPOPEText + "</td></tr>";

    // add the new row to tbody
    (data.statTable[0].getElementsByTagName("tbody"))[0].innerHTML += newText;

    // or add it directly to the PE row, but can cause overflow in small screens
    //var addedPETotalText = "<td>" + numberWithCommas(totalPE) + "</td>";
    //rowPE.innerHTML += addedPETotalText;
}

function getPVPTierInfo () {

    // fetch the PVP tier list
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/PvP&action=render", false);
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
    xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/Raid&action=render", false);
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
    xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/Tower&action=render", false);
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

    var skillLink1 = skillList[0].getAttribute("href");
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

        var skillLink2 = skillList[1].getAttribute("href");
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
    if (displayPOPE || displayTotalPE) getStats();
    if (displayPOPE) addPOPEStats();
    if (displayTotalPE || displayTotalPOPE) addTotalStats();
    if (displayTier) addTierInfo();
    if (displaySkill) addSkillInfo();
}
catch (err) {
    console.log("error: " + err);
    console.log("bb_extra error: probably not a fam page");
}
