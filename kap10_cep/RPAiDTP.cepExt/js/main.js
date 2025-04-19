let csInterface = new CSInterface();
let resourceBundle = csInterface.initResourceBundle();

try {
    document.getElementById("welcomeHello").innerHTML = resourceBundle.greetingString;
    document.getElementById("welcomeTxt").innerHTML = resourceBundle.welcomeTextString;
} catch(e) {

}

let hostColors = csInterface.hostEnvironment.appSkinInfo.appBarBackgroundColor.color;

document.body.style.background = `rgba(${hostColors.red}, ${hostColors.green}, ${hostColors.blue}, 1)`;


function registerKeys(item) {
    item.setAttribute("disabled", true);
    item.value += " executed";

    let infoArea = document.getElementById("keyEventsArea");
    infoArea.style.height = "16px";


    let registeredKeysMac = [{
        "keyCode": 9 // V
    },
    {
        "keyCode": 0, // A
        "metaKey": true
    }];

    let registeredKeysWin = [{
        "keyCode": 86 // V
    },
    {
        "keyCode": 65, // A
        "ctrlKey": true
    }];


if(csInterface.getOSInformation().includes("Mac")) {
    csInterface.registerKeyEventsInterest(JSON.stringify(registeredKeysMac));
} else {
    csInterface.registerKeyEventsInterest(JSON.stringify(registeredKeysWin));
}

    window.addEventListener("keydown", function(e) {

        if (e.keyCode == 86) {
            //alert("V pressed");
        } else if (e.metaKey && e.keyCode == 65) {
            //alert("cmd+A pressed");
        } else if (e.ctrlKey && e.keyCode == 65) {
            //alert("Ctrl+A pressed");
        }

        infoArea.innerHTML = "";

        if(e.metaKey) {
            infoArea.innerHTML = "metaKey+";
        }

        if(e.ctrlKey) {
            infoArea.innerHTML = "ctrlKey+";
        }

        infoArea.innerHTML += e.keyCode;
    });
}


let docActive;

csInterface.evalScript("app.activeDocument.name;", function(result) { 
    docActive = result;
});


// s: https://github.com/douglascrockford/JSON-js
// csInterface.evalScript(`$.evalFile('${csInterface.getSystemPath(SystemPath.EXTENSION)}/js/includes/json2.js');`);


csInterface.evalScript(`$.evalFile('${csInterface.getSystemPath(SystemPath.EXTENSION)}/jsx/helper.jsx');`);


function appInfo() {
    alert(`appId: ${csInterface.hostEnvironment.appId}
        appName: ${csInterface.hostEnvironment.appName}
        appVersion: ${csInterface.hostEnvironment.appVersion}
        appLocale: ${csInterface.hostEnvironment.appLocale}`);
}

function docName() {
    csInterface.evalScript("alert(app.activeDocument.name);");
}

/*function evalScriptAsync(s) {
    return new Promise(function(resolve, reject){
        csInterface.evalScript(s, resolve);
    });
}*/

function docPagesJs() {
    if(csInterface.hostEnvironment.appName == "IDSN") {
        csInterface.evalScript("String(app.activeDocument.pages.length);", function(result) { 
            alert(`Das aktive Dokument enthält ${result} Seite${result > 1 ? 'n' : ''}`);
        });
    } else {
        alert(`Funktion wird lediglich von InDesign unterstützt.`);
    }
}

function docPagesJsx() {
    if(csInterface.hostEnvironment.appName == "IDSN") {
        csInterface.evalScript("getDocPages();", function(result) { 
            alert(`Das aktive Dokument enthält ${result} Seite${result > 1 ? 'n' : ''}`);
        });
    } else {
        alert(`Funktion wird lediglich von InDesign unterstützt.`);
    }
}

function returnVar() {
    csInterface.evalScript("var a = 'eins'; var b = 'zwei'; var c = 'drei'; c; b; a;", function(result) { 
        alert(result);
    });
}

function returnNumJs() {
    csInterface.evalScript("1984", function(result) { 
        alert(`${typeof result}: ${result}`);
    });
}


function returnNumAsStringJs() {
    csInterface.evalScript("String(1984)", function(result) { 
        alert(`${typeof result}: ${result}`);
    });
}

function returnNumJsx() {
    csInterface.evalScript("returnNumJsx();", function(result) { 
        alert(`${typeof result}: ${result}`);
    });
}


function returnNumAsStringJsx() {
    csInterface.evalScript("returnNumAsStringJsx();", function(result) { 
        alert(`${typeof result}: ${result}`);
    });
}

function returnNumAsStringJsxParsed() {
    csInterface.evalScript("returnNumAsStringJsx();", function(result) {
        result = JSON.parse(result);
        alert(`${typeof result}: ${result}`);
    });
}


function exchangeData() {
    let data;
    for (rb of document.getElementById("dataExchItems").querySelectorAll("input[type='radio']")) {
        if (rb.checked) {
            switch (rb.value){
            case "String":
                data = "'Hello world!'";
                break;
            case "Number":
                data = 42;
                break;
            case "Boolean":
                data = true;
                break;
            case "Array":
                data = "[1, 2, 3, 4, 5]";
                break;
            case "Object":
                data = "{'a': 1, 'b': 2, 'c': 3}";
                break;
            }

            alert(`${typeof data}: ${data}`);
            csInterface.evalScript(`exchangeDataJsx(${data}, "${rb.value}");`, function(result) { 
                alert(`${typeof result}: ${result}`);
                let o = JSON.parse(result.replace(/'/g, "\""));
                alert(`${typeof o}: ${o}`);
            });
        }
    }
}

//csInterface.evalScript(`exchangeDataJsx("{'a': 1, 'b': 2, 'c': 3}");`);
//csInterface.evalScript(`exchangeDataJsx("[1, 2, 3, 4, 5]");`);

//csInterface.evalScript(`exchangeDataJsx(${JSON.stringify({'a': 1, 'b': 2, 'c': 3})});`);
//csInterface.evalScript(`exchangeDataJsx(${JSON.stringify([1, 2, 3, 4, 5])});`);


function docPages222() {
    if(csInterface.hostEnvironment.appName == "IDSN") {

        csInterface.evalScript("String(app.activeDocument.pages.length)", function(result) {
            let o = "<hr><h3>Dokumentenseiten:</h3>";
            for(let i=0; i<Number(result); i++) {
                o += `<div class='pageDummy'><p>${i+1}</p></div>`;
            }
            document.getElementById("docPagesResult").innerHTML = o;
        });

        
        /*
        evalScriptAsync('return app.activeDocument.pages.length')
        .then(function(result){
            alert(result)
        });
        */

    } else {
        alert("Funktion ist nur in InDesign verfügbar.");
    }
}



function elInit(e) {
    let val = e.value;

    if(val.includes("deaktivieren")) {
        csInterface.removeEventListener("documentAfterActivate", evDocActive);
        csInterface.removeEventListener("documentAfterDeactivate", evDocInactive);
        csInterface.removeEventListener("applicationActivate", evAppActive);

        csInterface.removeEventListener("com.adobe.csxs.events.flyoutMenuOpened", evFmClick);
        csInterface.removeEventListener("com.adobe.csxs.events.flyoutMenuClosed", evFmClick);

        document.getElementById(e.id).value = val.replace("deaktivieren", "aktivieren");
        alert("EventListener deaktiviert");
    } else {
        csInterface.addEventListener("documentAfterActivate", evDocActive);
        csInterface.addEventListener("documentAfterDeactivate", evDocInactive);
        csInterface.addEventListener("applicationActivate", evAppActive);

        csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuOpened", evFmClick);
        csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClosed", evFmClick);

        document.getElementById(e.id).value = val.replace("aktivieren", "deaktivieren");
        alert("EventListener aktiviert");
    }
}

function evDocActive() {
    csInterface.evalScript(
        "var doc = app.activeDocument.name; \
        alert('Dokument ' + doc + ' aktiviert'); \
        doc;", 
        function(result) { 
            docActive = result; 
        });
}

function evDocInactive() {
    csInterface.evalScript("alert('Dokument " + docActive + " deaktiviert')");
}

function evAppActive() {
    csInterface.evalScript("alert('Anwendung " + csInterface.hostEnvironment.appName + " im Fokus')");
}

let fmStatus = false;

function evFmClick() {
    fmStatus = !fmStatus;
    csInterface.evalScript(`alert('Panel-Menü ${fmStatus ? "geöffnet" : "geschlossen"}.')`);
}


let panelMenu = `
<Menu>
    <MenuItem Id="pmOptOne" Label="aktiv / ausgewählt" Enabled="true" Checked="true" />
    <MenuItem Id="pmOptTwo" Label="aktiv / abgewählt" Enabled="true" Checked="false" />
    <MenuItem Id="pmOptThree" Label="inaktiv / ausgewählt" Enabled="false" Checked="true" />
    <MenuItem Id="pmOptFour" Label="inaktiv / abgewählt" Enabled="false" Checked="false" />
    <MenuItem Id="pmOptFive" Label="alle aktivieren / auswählen" Enabled="true" Checked="false" />

    <MenuItem Label="---" />

    <MenuItem Id="pmOptFatherOne" Label="Vater 1">
        <MenuItem Id="pmOptChildOne" Label="Kind 1, aktiv / ausgewählt" Enabled="true" Checked="true" />
        <MenuItem Id="pmOptChildTwo" Label="Kind 2, aktiv / abgewählt" Enabled="true" Checked="false" />
        <MenuItem Id="pmOptChildThree" Label="Kind 3, inaktiv / ausgewählt" Enabled="false" Checked="true" />
        <MenuItem Id="pmOptChildFour" Label="Kind 4, inaktiv / abgewählt" Enabled="false" Checked="false" />
        <MenuItem Id="pmOptFatherTwo" Label="Vater 2">
            <MenuItem Id="pmOptChildFive" Label="Kind 5" Enabled="true" Checked="false" />
        </MenuItem>
    </MenuItem>
</Menu>
`;

csInterface.setPanelFlyoutMenu(panelMenu);
csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", pmSelection);


let pmOptTwoSelected = false;

function pmSelection(item) {

    switch (item.data.menuId) {

    case "pmOptOne":
        alert("Erste Menüoption gewählt.");
        break;

    case "pmOptTwo":
        pmOptTwoSelected = !pmOptTwoSelected;
        csInterface.updatePanelMenuItem("aktiv / abgewählt", true, pmOptTwoSelected);
        break;

    case "pmOptFive":
        csInterface.updatePanelMenuItem("aktiv / ausgewählt", true, true);
        csInterface.updatePanelMenuItem("aktiv / abgewählt", true, true);
        csInterface.updatePanelMenuItem("inaktiv / ausgewählt", true, true);
        csInterface.updatePanelMenuItem("inaktiv / abgewählt", true, true);
        csInterface.updatePanelMenuItem("alle aktivieren / auswählen", true, true);
        csInterface.updatePanelMenuItem("Kind 1, aktiv / ausgewählt", true, true);
        csInterface.updatePanelMenuItem("Kind 2, aktiv / abgewählt", true, true);
        csInterface.updatePanelMenuItem("Kind 3, inaktiv / ausgewählt", true, true);
        csInterface.updatePanelMenuItem("Kind 4, inaktiv / abgewählt", true, true);
    }
}


let iconPath;

if(csInterface.getOSInformation().includes("Mac")) {
    iconPath = "./img/";
} else {
    iconPath = ".\\img\\";
}


let contextMenu = `
<Menu>
    <MenuItem Id="cmOptOne" Label="aktiv / ausgewählt" Enabled="true" Checked="true" Checkable="true" />
    <MenuItem Id="cmOptTwo" Label="aktiv / abgewählt" Enabled="true" Checked="false" Checkable="true" />
    <MenuItem Id="cmOptThree" Label="inaktiv / ausgewählt" Enabled="false" Checked="true" />
    <MenuItem Id="cmOptFour" Label="inaktiv / abgewählt" Enabled="false" Checked="false" />

    <MenuItem Label="---" />

    <MenuItem Id="cmOptFatherOne" Label="Vater 1">
        <MenuItem Id="cmOptChildOne" Label="Kind 1, aktiv / ausgewählt" Enabled="true" Checked="true" Icon="${iconPath}cmIconOne.png"/>
        <MenuItem Id="cmOptChildTwo" Label="Kind 2, aktiv / abgewählt" Enabled="true" Checked="false" Icon="${iconPath}cmIconTwo.png"/>
        <MenuItem Id="cmOptChildThree" Label="Kind 3, inaktiv / ausgewählt" Enabled="false" Checked="true" Icon="${iconPath}cmIconThree.png"/>
        <MenuItem Id="cmOptChildFour" Label="Kind 4, inaktiv / abgewählt" Enabled="false" Checked="false" Icon="${iconPath}cmIconFour.png"/>
        <MenuItem Id="cmOptFatherTwo" Label="Vater 2" Icon="${iconPath}cmIconFive.png">
            <MenuItem Id="cmOptChildFive" Label="Kind 5" Enabled="true" Checked="false" Checkable="true" />
        </MenuItem>
    </MenuItem>
</Menu>
`;

csInterface.setContextMenu(contextMenu, cmSelection);

function cmSelection(id) {
    alert(`Auswahl: ${id}`);
}

let contextMenuJson = `
{
    "menu": [
    {
        "id": "cmOptOne",
        "label": "aktiv / ausgewählt",
        "enabled": true,
        "checked": true,
        "checkable": true
    },
    {
        "id": "cmOptTwo",
        "label": "aktiv / abgewählt",
        "enabled": true,
        "checked": false,
        "checkable": true
    },
    {
        "id": "cmOptThree",
        "label": "inaktiv / ausgewählt",
        "enabled": false,
        "checked": true
    },
    {
        "id": "cmOptFour",
        "label": "inaktiv / abgewählt",
        "enabled": false,
        "checked": false
    },
    {
        "label": "---"
    },
    {
        "id": "cmOptFatherOne",
        "label": "Vater 1",
        "menu": [
        {
            "id": "cmOptChildOne",
            "label": "Kind 1, aktiv / ausgewählt",
            "enabled": true,
            "checked": true,
            "icon": "${iconPath}cmiconOne.png"
        },
        {
            "id": "cmOptChildTwo",
            "label": "Kind 2, aktiv / abgewählt",
            "enabled": true,
            "checked": false,
            "icon": "${iconPath}cmiconTwo.png"
        },
        {
            "id": "cmOptChildThree",
            "label": "Kind 3, inaktiv / ausgewählt",
            "enabled": false,
            "checked": true,
            "icon": "${iconPath}cmiconThree.png"
        },
        {
            "id": "cmOptChildFour",
            "label": "Kind 4, inaktiv / abgewählt",
            "enabled": false,
            "checked": false,
            "icon": "${iconPath}cmiconFour.png"
        },
        {
            "id": "cmOptFatherTwo",
            "label": "Vater 2",
            "icon": "${iconPath}cmiconFive.png",
            "menu": [
            {
                "id": "cmOptChildFive",
                "label": "Kind 5",
                "enabled": true,
                "checked": false,
                "checkable": true
            }
            ]
        }
        ]
    }
    ]
}
`;

//csInterface.setContextMenuByJSON(contextMenuJson, cmSelection);


function vulcanMesssageInit() {
    let endpoints = VulcanInterface.getEndPoints();

    let regexId = /<appId>(.*?)<\/appId>/;
    let regexVersion = /<appVersion>(.*?)<\/appVersion>/;

    let o = "";

    let apps = ["IDSN", "PHXS", "ILST"];
    let types = ["cepTest", "cepTestZwei"];

    for (e of endpoints) {
        let appId = e.match(regexId)[1];
        let appVersion = e.match(regexVersion)[1];

        if (apps.includes(appId)) {
            for (t of types) {
                o += `
                <input type="button" onclick="vulcanMesssageSend('${appId}', '${appVersion}', '${t}');" value="Nachricht vom Typ ${t} an ${appId} ${appVersion}" />
                `;
            }
        }
    }

    document.getElementById("vulcanMessageButArea").innerHTML = o;
}

function vulcanMesssageCallback(message) {
    let m = VulcanInterface.getPayload(message);
    csInterface.evalScript(`alert('Nachricht vom Typ ${VulcanMessage.TYPE_PREFIX}cepTest: ${m} ${csInterface.hostEnvironment.appName}.')`);
};


VulcanInterface.addMessageListener(VulcanMessage.TYPE_PREFIX + "cepTest", vulcanMesssageCallback);


function vulcanMesssageSend(id, ver, type) {
    let vulcanMessage = new VulcanMessage(VulcanMessage.TYPE_PREFIX + type, id, ver);

    vulcanMessage.setPayload(`Grüße von ${csInterface.hostEnvironment.appName} an`);

    VulcanInterface.dispatchMessage(vulcanMessage);
}
