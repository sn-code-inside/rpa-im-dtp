const uxp = require("uxp");

const { app } = require(uxp.host.name.toLowerCase());

const os = require("os");


if (uxp.host.name == "Photoshop") {
    uxp.entrypoints.setup({
        commands: {
            newDoc: () => newDocPs(),
            sysInfo: () => sysInfo(),
            eventListener: () => eventListenerPs()
        },
        panels: {
            "showPanelMain": {
                show(body) {
                    body.appendChild(document.getElementById("panelMain"));
                }
            },
            "showPanelCssVars": {
                show(body) {
                    body.appendChild(document.getElementById("panelCssVars"));
                }
            },
            "showPanelUi": {
                show(body) {
                    body.appendChild(document.getElementById("panelUi"));
                }
            },
            "showPanelUiSpectrum": {
                show(body) {
                    body.appendChild(document.getElementById("panelUiSpectrum"));
                }
            },
            "showPanelUiSwc": {
                show(body) {
                    body.appendChild(document.getElementById("panelUiSwc"));
                }
            },
            "panelCsUxpMware": {
                show(body) {
                    body.appendChild(document.getElementById("panelCsUxpMware"));
                }
            }
        }
    });
} else if (uxp.host.name == "InDesign") {
    uxp.entrypoints.setup({
        commands: {
            newDoc: () => newDocId(),
            sysInfo: () => sysInfo(),
            eventListener: () => eventListenerId()
        },
        panels: {
            "showPanelMain": {
                show(body) {
                    body.appendChild(document.getElementById("panelMain"));
                }
            },
            "showPanelCssVars": {
                show(body) {
                    body.appendChild(document.createTextNode(`Diese Funktion wird in ${uxp.host.name} nicht unterstützt.`));
                }
            },
            "showPanelUi": {
                show(body) {
                    body.appendChild(document.getElementById("panelUi"));
                }
            },
            "showPanelUiSpectrum": {
                show(body) {
                    body.appendChild(document.getElementById("panelUiSpectrum"));
                }
            },
            "showPanelUiSwc": {
                show(body) {
                    body.appendChild(document.getElementById("panelUiSwc"));
                }
            },
            "panelCsUxpMware": {
                show(body) {
                    body.appendChild(document.getElementById("panelCsUxpMware"));
                }
            }

        }
    });
}


newDocId = () => {
    newDocFunc();
}
newDocPs = () => {
    newDocPsInit();
}

async function newDocPsInit() {
    await require("photoshop").core.executeAsModal(newDocFunc, {"commandName": "Neues Dokument (PS)"});
}

async function newDocFunc() { 
    app.documents.add();
}

function sysInfo() {
    alert(`platform: ${os.platform()}
        release: ${os.release()}
        arch: ${os.arch()}
        cpus: ${os.cpus()}
        totalmem: ${os.totalmem()}
        freemem: ${os.freemem()}
        homedir: ${os.homedir()}`);
}

function eventListenerId() {
    app.addEventListener("afterActivate", function() {
        console.log("Id im Fokus.");
    });

    app.addEventListener("beforeDeactivate", function() {
        console.log("Id nicht im Fokus.");
    });
}

function eventListenerPs() {
    require("photoshop").action.addNotificationListener(["hostFocusChanged"], (e, d) => {
        if(d.active) {
            console.log("Ps im Fokus.");
        } else {
            console.log("Ps nicht im Fokus.");
        }
    });
}

function eventListenerPsLog() {
    require("photoshop").action.addNotificationListener(["all"], (e, d) => {
        console.log(e, d);
    });
}


/* FALLBEISPIEL: UXP MIDDLEWARE-PANEL */

document.querySelector("#butValidate").onclick = () => validateSearch(document.getElementById("input_jobno").value);
document.querySelector("#butUrlPmsys").onclick = () => openUrl("pmsys");
document.querySelector("#butUrlDummy").onclick = () => openUrl("dummy");
document.querySelector("#butPath").onclick = () => openPath("dummy");
document.querySelector("#butStatStart").onclick = () => setStatus("Start ausstehend");
document.querySelector("#butStatOngoing").onclick = () => setStatus("In Bearbeitung");
document.querySelector("#butStatDone").onclick = () => setStatus("Erledigt");
document.querySelector("#butAssetXml").onclick = () => buildXml();
document.querySelector("#butAssetPdf").onclick = () => generateAssets("pdf");
document.querySelector("#butAssetWeb").onclick = () => generateAssets("web");


class Project {
    jobno;
    artno;
    name;
    desc;
    image;
    variant;
    brand;
    suppl;
    delivery;
    conSupp;
    conMerch;
    comments;
    status;
    idPmsys;
    imgPath;
}

let curSearch;


function validateSearch(input) {
    if(input.match("[0-9]{6}")) {
        searchJob(input);
    } else {
        alert("Ungültige Auftragsnummer");
    }
}


function searchJob(input) {
    curSearch = new Project();
    curSearch.jobno = input;

    const s1Config = {
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer placeholder"
        },
        "postData": JSON.stringify({query: 
            `{
                boards (ids: 1433585490) {
                    items_page {
                        items {
                            name
                            id
                            column_values {
                                text
                                column {
                                    title
                                    id
                                    settings_str
                                }
                            }
                        }
                    }
                }
            }`
        }),
        "host": "api.monday.com",
        "path": "/v2",
        "method": "POST"
    };
    
    const s2Config = {
        "headers": {
            "Content-Type": "application/json",
            "Authorization-Token": "placeholder"
        },
        "postData": "",
        "host": "atrocore.gndgn.dev",
        "path": "/api/v1/File?select=name&where=" + encodeURIComponent(JSON.stringify([{"type": "or", "value": [{"type": "like", "attribute": "name", "value": `%${curSearch.jobno}%`}]}])),
        "method": "GET"
    };


    // a) Laden und Strukturieren der Projektdaten
    loadProjData(s1Config) // Datenabruf aus a1) monday.com
    .then((res) => {
        structureData(res, "s1"); // Datenstrukturierung a1) monday.com
    })
    .then(() => {
        return loadProjData(s2Config); // Datenabruf aus a2) AtroCore
    })
    .then((res) => {
        structureData(res, "s2"); // Datenstrukturierung a2) AtroCore
    })
    /*.then(() => {
        dbInit(); // DB-Verbindungen a3) & a4) herstellen
    })*/
    .then(() => {
        return loadDbDataComp(); // Datenabruf aus a3) rpaidtp_cs_companyDb
    })
    .then((res) => {
        structureData(res); // Datenstrukturierung a3) rpaidtp_cs_companyDb
    })
    .then(() => {
        return loadDbDataProj(); // Datenabruf aus a4) rpaidtp_cs_productsDb
    })
    .then((res) => {
        structureData(res); // Datenstrukturierung a4) rpaidtp_cs_productsDb
    }) 
    .then(() => {
        displayData(); // b) Anzeigen der Daten in dem UI
    })
    .catch((err) => {
        console.error(err);
    });
}


async function loadProjData(config) {
    const response = await fetch("https://" + config.host + config.path, {
        method: config.method,
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: config.headers,
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: config.postData,
    });
    return response.text();
};


function structureData(input, sys) {
    if (typeof input == "object") { // DB data

        if (input[0].prodname) { // rpaidtp_cs_companyDb
            curSearch.artno = input[0].artno;
            curSearch.name = input[0].prodname;
            curSearch.variant = input[0].prodvar;
        } else { // rpaidtp_cs_productsDb
            curSearch.desc = input[0].descr;
        }
    } else {
        let data = JSON.parse(input);

        console.log(sys)
        console.log(input)
        console.log(data)

        if (data.data) { // System 1

            try {
                curSearch.idPmsys = data.data.boards[0].items_page.items.filter(i => i.name == curSearch.jobno)[0].id;

                data = data.data.boards[0].items_page.items.filter(i => i.name == curSearch.jobno)[0].column_values;

                curSearch.brand = data.filter(i => i.column.title == "Marke")[0].text;
                curSearch.suppl = data.filter(i => i.column.title == "Lieferant")[0].text;
                curSearch.delivery = data.filter(i => i.column.title == "Datum")[0].text;
                curSearch.conSupp = data.filter(i => i.column.title == "Kontakt Lieferant")[0].text;
                curSearch.conMerch = data.filter(i => i.column.title == "Kontakt Händler")[0].text;
                curSearch.comments = data.filter(i => i.column.title == "Notizen")[0].text;
                curSearch.status = data.filter(i => i.column.title == "Status")[0].text;

            } catch(e) {
                console.error(e);
            }

        } else { // System 2

            try {
                curSearch.image = `https://atrocore.gndgn.dev${data.list[0].largeThumbnailUrl}`;
            } catch(e) {
                console.error(e);
            }
        }
    }
}


async function loadDbDataComp() {
    let q = { query: "SELECT artno, prodname, prodvar FROM projects WHERE jobno=" + curSearch.jobno };
    try {
        const response = await fetch(
            "http://localhost:9999/loadDbDataComp", 
            {
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                mode: "cors", 
                body: JSON.stringify(q) 
            });

        const data = await response.json();
        console.log(data);
        return data;

    } catch (error) {
        console.error(error);
    }
}


async function loadDbDataProj() {
    let q = { query: "SELECT descr FROM products WHERE artno='" + curSearch.artno + "'" };
    try {
        const response = await fetch(
            "http://localhost:9999/loadDbDataProj", 
            { 
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                mode: "cors", 
                body: JSON.stringify(q) 
            });

        const data = await response.json();
        console.log(data);
        return data;

    } catch (error) {
        console.error(error);
    }
}


function displayData() {
    document.getElementById("projData_artno").innerHTML = curSearch.artno;
    document.getElementById("projData_name").innerHTML = curSearch.name;
    document.getElementById("projData_variant").innerHTML = curSearch.variant;
    document.getElementById("projData_brand").innerHTML = curSearch.brand;
    document.getElementById("projData_suppl").innerHTML = curSearch.suppl;
    document.getElementById("projData_delivery").innerHTML = curSearch.delivery;
    document.getElementById("projData_conSupp").innerHTML = curSearch.conSupp;
    document.getElementById("projData_conMerch").innerHTML = curSearch.conMerch;
    document.getElementById("projData_status").innerHTML = curSearch.status;
    document.getElementById("projData_comments").innerHTML = curSearch.comments;

    document.getElementById("projImg").style.backgroundImage = `url('${curSearch.image}')`;
}


function openUrl(i) {
    let s = "https://";

    switch(i) {
    case "pmsys": 
        s += `rpaidtp.monday.com/boards/1433585490/pulses/${curSearch.idPmsys}`;
        break;

    case "dummy":
        s += "gndgn.dev";
        break;
    }

    uxp.shell.openExternal(s);
}


function openPath(p) {
    p = "/";

    uxp.shell.openPath(p);
}


function setStatus(stat) {
    const postData = JSON.stringify({query: `mutation {
        change_column_value(
        item_id: ${curSearch.idPmsys},
        board_id: 1433585490,
        column_id: "project_status", 
        value: "{\\\"label\\\": \\\"${stat}\\\"}"
        ) {
            id
        }
    }`});

    const options = {
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer placeholder"
        },
        "postData": postData,
        "host": "api.monday.com",
        "path": "/v2",
        "method": "POST"
    };

    loadProjData(options);
}


async function buildXml() {
    try {
        const response = await fetch(
            "http://localhost:9999/buildXml", 
            {
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                mode: "cors", 
                body: JSON.stringify(curSearch) 
            });

    } catch (error) {
        console.error(error);
    }
}


function generateAssets(type) {
    switch(type) {

    case "pdf":
        if(uxp.host.name == "InDesign") {
            generatePdfSheet(curSearch, true);
        } else {
            alert("Diese Funktion ist nur in InDesign verfügbar.");
        }
        break;

    case "web":
        if(uxp.host.name == "Photoshop") {
            generateWebImages(curSearch, true);
        } else {
            alert("Diese Funktion ist nur in Photoshop verfügbar.");
        }
        break;
    }
}


async function generatePdfSheet(input, notif) {

    const { 
        DocumentIntentOptions, 
        PageOrientation, 
        FitOptions, 
        VerticalJustification, 
        AutoSizingReferenceEnum, 
        AutoSizingTypeEnum, 
        ExportFormat, 
        SaveOptions 
    } = require("indesign");

    app.documents.add({!!
        documentPreferences: {
            intent: DocumentIntentOptions.WEB_INTENT,
            pageWidth: "148mm",
            pageHeight: "105mm",
            orientation: PageOrientation.LANDSCAPE
        }
    });

    let doc = app.activeDocument;

    doc.textFrames.add({!
        geometricBounds: ["10mm", "10mm", "70mm", "70mm"]
    });

    async function imgBuffer() {
        return fetch(curSearch.image)
        .then((response) => {
            return response.arrayBuffer();
        });
    }

    let tempImage = await imgBuffer();

    const tempFolder = await uxp.storage.localFileSystem.getTemporaryFolder();
    const tempFile = await tempFolder.createFile(curSearch.jobno + ".png", { overwrite: true });
    await tempFile.write(tempImage);

    doc.textFrames.firstItem().place((tempFile));!
    doc.pageItems.firstItem().fit(FitOptions.PROPORTIONALLY);!

    doc.textFrames.add({
        geometricBounds: ["70mm", "10mm", "94mm", "90mm"],
        contents: input.name + "\n" + input.variant
    });

    doc.textFrames.firstItem().lines.item(0).appliedFont = app.fonts.itemByName("Myriad Pro\tRegular");
    doc.textFrames.firstItem().lines.item(0).pointSize = 30;

    doc.textFrames.firstItem().lines.item(1).appliedFont = app.fonts.itemByName("Myriad Pro\tItalic");
    doc.textFrames.firstItem().lines.item(1).pointSize = 20;
    doc.textFrames.firstItem().lines.item(1).leading = 18;

    doc.textFrames.add({ 
        geometricBounds: ["30mm", "80mm", "94mm", "136mm"],
        contents: "Art.-Nr.: " + input.artno + "\nMarke: " + input.brand + "\n\nBeschreibung: " + input.desc
    });

    doc.textFrames.item(0).texts.item(0).appliedFont = app.fonts.itemByName("Myriad Pro\tRegular");
    doc.textFrames.item(0).texts.item(0).pointSize = 12; 

    doc.textFrames.item(0).textFramePreferences.properties = doc.textFrames.item(1).textFramePreferences.properties = {
        verticalJustification: VerticalJustification.BOTTOM_ALIGN,
        autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
        autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY
    };

    let path = os.homedir() + "/Desktop/" + input.artno + "_" + input.name + "_" + input.variant + ".pdf";

    doc.exportFile(ExportFormat.PDF_TYPE, path);
    doc.close(SaveOptions.NO);

    if(notif) {
        alert("Export abgeschlossen\nPDF-Datenblatt exportiert in\n" + path);
    }
}



async function generateWebImages(input, notif) {

    const constants = require("photoshop").constants;
    const fs = require("uxp").storage.localFileSystem;
    
    let fileP = `${os.homedir()}/Desktop/${input.artno}_${input.name}_${input.variant}.pdf`;

    await require("photoshop").core.executeAsModal(openFile, {"commandName": "PDF-Datei öffnen"});
    async function openFile() {
        try {
            const f = await fs.getEntryWithUrl(fileP);
            if (f) {
                await app.open(f);
            } else {
                console.log("Datei existiert nicht.");
            }
        } catch (error) {
            console.error(error);
        }
    }

    let doc = app.activeDocument;
    let docWs = [1600, 1200, 900, 600];

    for (w of docWs) {
        let newH = Math.round(doc.height / doc.width * w);

        await require("photoshop").core.executeAsModal(resizeImg, {"commandName": "Bild skalieren"});
        async function resizeImg() {
            await doc.resizeImage(w, newH);
        }

        await require("photoshop").core.executeAsModal(saveFile, {"commandName": "JPG-Datei exportieren"});
        async function saveFile() {
            let fileS = `${input.artno}_${input.name}_${input.variant}_${w}x${newH}.jpg`;

            try {
                const f = await fs.getFileForSaving(fileS);
                if (f) {
                    await doc.saveAs.jpg(f, { }, true);
                } else {
                    console.log("Speicherpfad nicht ausgewählt.");
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    await require("photoshop").core.executeAsModal(closeDoc, {"commandName": "JPG-Datei exportieren"});
    async function closeDoc() {
        doc.close(constants.SaveOptions.DONOTSAVECHANGES);
    }

    if(notif) {
        alert(`Export abgeschlossen: ${docWs.length} Grafiken exportiert.`);
    }
}

