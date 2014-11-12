// ==UserScript==
// @name         bb_extra
// @version      0.6.7.2
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

    pvpTier: "N/A",
    raidTier: "N/A",
    towerTier: "N/A",

    price: "N/A",
    priceDate:"",

    category: "",
    statTable: "",
    isFinalEvolution: false
};

var tierURL = [];
tierURL.pvp   = "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/PvP&action=render";
tierURL.raid  = "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/Raid&action=render";
tierURL.tower = "http://bloodbrothersgame.wikia.com/index.php?title=Familiar_Tier_List/Tower&action=render";

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getStats () {

    function onFinishCalculatedPOPE() {
        if (displayTotalPE || displayTotalPOPE) addTotalStats();
    }
    
    /**
     * Parse the POPE info from the POPE table, then add it to our page
     */
    function getPOPEFromTable() {
        // parse the response text into DOM
        var doc = document.implementation.createHTMLDocument("POPE");
        doc.documentElement.innerHTML = sessionStorage.popeTable;
        
        var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML.trim();
        var table = (doc.getElementsByClassName("wikitable"))[0];
        var rows = (table.getElementsByTagName("tbody"))[0].getElementsByTagName("tr");
        
        for (var i = rows.length - 1; i >= 2; i--) {
            try {
                var cells = rows[i].getElementsByTagName("td");
                var cellFam = (cells[2].innerText || cells[2].textContent).trim();
                if (cellFam == famName) {
                    data.hpPOPE  = parseInt((cells[5].innerText || cells[5].textContent).replace(/,/g, ""));
                    data.atkPOPE = parseInt((cells[6].innerText || cells[6].textContent).replace(/,/g, ""));
                    data.defPOPE = parseInt((cells[7].innerText || cells[7].textContent).replace(/,/g, ""));
                    data.wisPOPE = parseInt((cells[8].innerText || cells[8].textContent).replace(/,/g, ""));
                    data.agiPOPE = parseInt((cells[9].innerText || cells[9].textContent).replace(/,/g, ""));
                }
            } catch (e) {}
        }
        onFinishCalculatedPOPE();
    }

    data.statTable = document.getElementsByClassName("article-table");
    var rowPE = ((data.statTable[0].getElementsByTagName("tbody"))[0].getElementsByTagName("tr"))[3];
    
    //PE stats
    data.hpPE  = parseInt((rowPE.getElementsByTagName("td"))[1].childNodes[0].nodeValue.replace(/,/g, ""));
    data.atkPE = parseInt((rowPE.getElementsByTagName("td"))[2].childNodes[0].nodeValue.replace(/,/g, ""));
    data.defPE = parseInt((rowPE.getElementsByTagName("td"))[3].childNodes[0].nodeValue.replace(/,/g, ""));
    data.wisPE = parseInt((rowPE.getElementsByTagName("td"))[4].childNodes[0].nodeValue.replace(/,/g, ""));
    data.agiPE = parseInt((rowPE.getElementsByTagName("td"))[5].childNodes[0].nodeValue.replace(/,/g, ""));

    data.isFinalEvolution = (document.getElementsByClassName("container")[0]).innerHTML.indexOf("Final Evolution") != -1;
    data.category = ((document.getElementsByClassName("name"))[0].getElementsByTagName("a"))[0].childNodes[0].nodeValue;

    if (data.isFinalEvolution) {        
        var toAdd = 0;
        if (endsWith(data.category, "1")) toAdd = 500;      // 1 star
        else if (endsWith(data.category, "2")) toAdd = 550; // 2 star
        else if (endsWith(data.category, "3")) toAdd = 605; // 3 star

        if (endsWith(data.category, "1")) {
            // we generally don't care about the max stats, but in this case (1 star) we do
            var rowMax = ((data.statTable[0].getElementsByTagName("tbody"))[0].getElementsByTagName("tr"))[2];
            data.hpMax  = parseInt((rowMax.getElementsByTagName("td"))[1].childNodes[0].nodeValue.replace(/,/g, ""));
            data.atkMax = parseInt((rowMax.getElementsByTagName("td"))[2].childNodes[0].nodeValue.replace(/,/g, ""));
            data.defMax = parseInt((rowMax.getElementsByTagName("td"))[3].childNodes[0].nodeValue.replace(/,/g, ""));
            data.wisMax = parseInt((rowMax.getElementsByTagName("td"))[4].childNodes[0].nodeValue.replace(/,/g, ""));
            data.agiMax = parseInt((rowMax.getElementsByTagName("td"))[5].childNodes[0].nodeValue.replace(/,/g, ""));

            data.hpPOPE  = data.hpMax  + toAdd;
            data.atkPOPE = data.atkMax + toAdd;
            data.defPOPE = data.defMax + toAdd;
            data.wisPOPE = data.wisMax + toAdd;
            data.agiPOPE = data.agiMax + toAdd;

            onFinishCalculatedPOPE();
        }
        else if (!endsWith(data.category, "4")){
            data.hpPOPE  = data.hpPE  + toAdd;
            data.atkPOPE = data.atkPE + toAdd;
            data.defPOPE = data.defPE + toAdd;
            data.wisPOPE = data.wisPE + toAdd;
            data.agiPOPE = data.agiPE + toAdd;

            onFinishCalculatedPOPE();
        }
        else {
            // only fetch the POPE stat table when it's a 4-star familiar
            if (!sessionStorage.popeTable) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        sessionStorage.popeTable = xmlhttp.responseText;
                        getPOPEFromTable();
                    }
                };
                xmlhttp.open("GET", "http://bloodbrothersgame.wikia.com/wiki/POPE_Stats_Table", true);
                xmlhttp.send();
                console.log("Fetching POPE table");
            }
            else {
                // already cached, just parse it and get the result
                getPOPEFromTable();
            }   
        }
    }
}

/**
 * Inject the total stats HTML into the page
 */
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

/*
* Initially, call getPvP(), which has getRaid() as callback,
*                 getRaid() has getTower() as callback
*    and finally, getTower() has addTierInfo() as callback
* Ideally, getPvP(), getRaid() and getTower() should be done in parallel instead of 
* being done serially like this, but that's for later
*/
function getTierInfo () {

    function getPvP() {
        // fetch the pvp tier page
        if (!sessionStorage.pvp) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    sessionStorage.pvp = xmlhttp.responseText;
                    data.pvp = getTier("pvp");
                    getRaid();
                }
            };
            xmlhttp.open("GET", tierURL.pvp, true);
            xmlhttp.send();
            sessionStorage.pvp = xmlhttp.responseText;
            console.log("Fetching pvp tier");
        }
        else {
            data.pvp = getTier("pvp");
            getRaid();
        }
    }

    function getRaid() {
        // fetch the raid tier page
        if (!sessionStorage.raid) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    sessionStorage.raid = xmlhttp.responseText;
                    data.raid = getTier("raid");
                    getTower();
                }
            };
            xmlhttp.open("GET", tierURL.raid, true);
            xmlhttp.send();
            sessionStorage.raid = xmlhttp.responseText;
            console.log("Fetching raid tier");
        }
        else {
            data.raid = getTier("raid");
            getTower();
        }
    }

    function getTower() {
        // fetch the tower tier page
        if (!sessionStorage.tower) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    sessionStorage.tower = xmlhttp.responseText;
                    data.tower = getTier("tower");
                    addTierInfo();
                }
            };
            xmlhttp.open("GET", tierURL.tower, true);
            xmlhttp.send();
            sessionStorage.tower = xmlhttp.responseText;
            console.log("Fetching tower tier");
        }
        else {
            data.tower = getTier("tower");
            addTierInfo();
        }
    }

    function getTier(category) {
        // parse the response text into DOM
        var tierResult = "N/A";
        var tierTable = "";
        var doc = document.implementation.createHTMLDocument("Tier");
        doc.documentElement.innerHTML = sessionStorage[category];

        var tables = doc.getElementsByClassName("wikitable");
        
        if (!tables) {
            return tierResult;
        }

        //var tiers = ['X', 'S+', 'S', 'A+', 'A', 'B', 'C', 'D', 'E'];
        var famName = (document.getElementById("WikiaPageHeader").getElementsByTagName("h1"))[0].innerHTML;

        for (var i = 0; i < tables.length; i++){ // 9 tables
            if (!tables[i])
                break;
            var items = tables[i].innerHTML;
            if (items.indexOf(famName) != -1) {
                tierTable = tables[i].id;
                tierResult = tierTable.substr(5).replace(".2B", "+");
                console.log("Tier: " + tierResult);
                break;
            }
        }
        return tierResult;
    }

    getPvP();
}

/*
* Add the tier info row to the stat table
* This has to be called AFTER the tiers info have all been fetched
*/
function addTierInfo () {
    var table = (document.getElementsByClassName("article-table"))[0];

    var newText = "<tr>" + 
            "<td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='PVP tier'><a>PVP</a></span></td><td>" 
            + data.pvp + "</td><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Raid tier'><a>Raid</a></span></td><td>" 
            + data.raid + "</td><td style='text-align:center;padding:0em;'><span style='border-bottom: 1px dotted; font-weight: bold; padding: 0em' title='Tower tier'><a>Tower</a></span></td><td>" 
            + data.tower + "</td></tr>";
     
    // add the new row to tbody
    (table.getElementsByTagName("tbody"))[0].innerHTML += newText;
}

function addSkillInfo () {

    // get the list of skills
    var skillList = (((document.getElementsByClassName("infobox"))[0].getElementsByTagName("tr"))[3]).getElementsByTagName("a");

    var skillLink1 = skillList[0].getAttribute("href");
    if (!sessionStorage[skillLink1]) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                sessionStorage[skillLink1] = xmlhttp.responseText;
                skill1();
            }
        };
        xmlhttp.open("GET", skillLink1, true);
        xmlhttp.send();        
    }
    else {
        skill1();
    }

    function skill1 () {
        // parse the response text into DOM
        var doc = document.implementation.createHTMLDocument("Skill");
        doc.documentElement.innerHTML = sessionStorage[skillLink1];

        // get the skill info box
        var infoBox = (doc.getElementsByClassName("infobox"))[0];

        // insert the skill box to the side
        var searchBox = document.getElementById("WikiaSearch");
        searchBox.parentNode.insertBefore(infoBox, searchBox.nextSibling);
    }
    
    function skill2 () {
        // parse the response text into DOM
        var doc = document.implementation.createHTMLDocument("Skill");
        doc.documentElement.innerHTML = sessionStorage[skillLink2];
        
        // get the skill info box
        var infoBox = (doc.getElementsByClassName("infobox"))[0];
        
        // insert the skill box to the side
        var searchBox = document.getElementById("WikiaSearch");
        searchBox.parentNode.insertBefore(infoBox, searchBox.nextSibling);
    }

    // if there's a second skill, add it too
    if (!(typeof skillList[1] === 'undefined')) {

        var skillLink2 = skillList[1].getAttribute("href");
        if (!sessionStorage[skillLink2]) {
            var xmlhttp2 = new XMLHttpRequest();
            xmlhttp2.onreadystatechange = function() {
                if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
                    sessionStorage[skillLink2] = xmlhttp2.responseText;
                    skill2();
                }
            };
            xmlhttp2.open("GET", skillLink2, true);
            xmlhttp2.send();            
        }
        else {
            skill2();
        }
    }
}

try {
    getStats();    
    if (displayTier) getTierInfo();
    if (displaySkill) addSkillInfo();
}
catch (err) {
    console.log("error: " + err);
    console.log("bb_extra error: probably not a fam page");
}
