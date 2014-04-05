// ==UserScript==
// @name         bb_extra
// @version      0.6.4.1
// @description  Display extra information in the Blood Brothers wikia familiar pages
// @include      http://bloodbrothersgame.wikia.com/wiki/*
// @copyright    2014, Chin
// @run-at       document-end
// @grant        none
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
    hpMax:   0,
    atkMax:  0,
    defMax:  0,
    wisMax:  0,
    agiMax:  0,

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
    statTable: "",
    isFinalEvolution: false
};

var tierURL = new Array();
tierURL["pvp"]   = "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/PvP&action=render";
tierURL["raid"]  = "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/Raid&action=render";
tierURL["tower"] = "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/Tower&action=render";

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
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

    data.isFinalEvolution = (document.getElementsByClassName("container")[0]).innerHTML.indexOf("Final Evolution") != -1;

    if (data.isFinalEvolution) {
        // fetch the POPE stat table
        if (sessionStorage["popeTable"] == null) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/wiki/POPE_Stats_Table", false);
            xmlhttp.send();
            sessionStorage["popeTable"] = xmlhttp.responseText;
            console.log("Fetching POPE table");
        }
        // parse the response text into DOM
        var doc = document.implementation.createHTMLDocument("POPE");
        doc.documentElement.innerHTML = sessionStorage["popeTable"];

        var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML.trim();
        var table = (doc.getElementsByClassName("wikitable"))[0];
        var rows = (table.getElementsByTagName("tbody"))[0].getElementsByTagName("tr");

        for (var i = rows.length - 1; i >= 2; i--) {
            try {
                var cells = rows[i].getElementsByTagName("td");
                var cellFam = (cells[1].innerText || cells[1].textContent).trim();
                if (cellFam == famName) {
                    data.hpPOPE  = parseInt((cells[3].innerText || cells[3].textContent).replace(/,/g, ""));
                    data.atkPOPE = parseInt((cells[4].innerText || cells[4].textContent).replace(/,/g, ""));
                    data.defPOPE = parseInt((cells[5].innerText || cells[5].textContent).replace(/,/g, ""));
                    data.wisPOPE = parseInt((cells[6].innerText || cells[6].textContent).replace(/,/g, ""));
                    data.agiPOPE = parseInt((cells[7].innerText || cells[7].textContent).replace(/,/g, ""));
                }
            } catch (e) {}
        }
    }
}

function addPOPEStats() {

    if (data.isFinalEvolution) {

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
    var totalPEText = (isNaN(totalPE) || totalPE == 0)? "N/A" : numberWithCommas(totalPE);

    var totalPOPE = data.hpPOPE + data.atkPOPE + data.defPOPE + data.wisPOPE + data.agiPOPE;
    var totalPOPEText = (isNaN(totalPOPE) || totalPOPE == 0)? "N/A" : numberWithCommas(totalPOPE);
    
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

function getTierInfo (category) {

    // fetch the tier page
    if (sessionStorage[category] == null) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", tierURL[category], false);
        xmlhttp.send();
        sessionStorage[category] = xmlhttp.responseText;
        console.log("Fetching " + category + " tier");
    }
    // parse the response text into DOM
    var doc = document.implementation.createHTMLDocument("Tier");
    doc.documentElement.innerHTML = sessionStorage[category];

    var tables = doc.getElementsByClassName("wikitable");

    var tierResult = "N/A";
    var tiers = ['X', 'S+', 'S', 'A+', 'A', 'B', 'C', 'D', 'E'];
    var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML;

    for (var i = 0; i < 9; i++){ // 9 tables
        var items = tables[i].innerHTML;
        if (items.indexOf(famName) != -1) {
            tierResult = tiers[i];
            break;
        }
    }
    return tierResult;
}

function addTierInfo () {
    var table = (document.getElementsByClassName("article-table"))[0];

    var newText = "<tr>" + 
            "<td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='PVP tier'><a>PVP</a></span></td><td>" + getTierInfo("pvp") + "</td><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Raid tier'><a>Raid</a></span></td><td>" + getTierInfo("raid") + "</td><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Tower tier'><a>Tower</a></span></td><td>" + getTierInfo("tower") + "</td></tr>";
     
    // add the new row to tbody
    (table.getElementsByTagName("tbody"))[0].innerHTML += newText;
}

function addSkillInfo () {

    // fetch the skill page
    var skillList = (((document.getElementsByClassName("infobox"))[0].getElementsByTagName("tr"))[3]).getElementsByTagName("a");

    var skillLink1 = skillList[0].getAttribute("href");
    if (sessionStorage[skillLink1] == null) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", skillLink1, false);
        xmlhttp.send();
        sessionStorage[skillLink1] = xmlhttp.responseText;
    }

    // parse the response text into DOM
    var doc = document.implementation.createHTMLDocument("Skill");
    doc.documentElement.innerHTML = sessionStorage[skillLink1];

    // get the skill info box
    var infoBox = (doc.getElementsByClassName("infobox"))[0];

    // insert the skill box to the side
    var searchBox = document.getElementById("WikiaSearch");
    var addedSkillBox1 = searchBox.parentNode.insertBefore(infoBox, searchBox.nextSibling);

    // if there's a second skill, add it too
    if (!(typeof skillList[1] === 'undefined')) {

        var skillLink2 = skillList[1].getAttribute("href");
        if (sessionStorage[skillLink2] == null) {
            xmlhttp.open("GET", skillLink2, false);
            xmlhttp.send();
            sessionStorage[skillLink2] = xmlhttp.responseText;
        }

        // parse the response text into DOM
        doc = document.implementation.createHTMLDocument("Skill");
        doc.documentElement.innerHTML = sessionStorage[skillLink2];

        // get the skill info box
        infoBox = (doc.getElementsByClassName("infobox"))[0];

        // insert the skill box to the side
        addedSkillBox1.parentNode.insertBefore(infoBox, addedSkillBox1.nextSibling);
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
