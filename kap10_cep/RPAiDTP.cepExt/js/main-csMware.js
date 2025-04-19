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
    .then(() => {
        dbInit(); // DB-Verbindungen a3) & a4) herstellen
    })
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


function loadProjData(config) {

    console.log(config.path);

    return new Promise((resolve, reject) => {
        let resData = "";

        const https = require("https");

        const options = {
            hostname: config.host,
            port: 443,
            path: config.path,
            method: config.method,
            headers: config.headers,
        };

        const req = https.request(options, (res) => {
            res.setEncoding("utf8");

            res.on("data", (chunk) => {
                resData += chunk;
            });

            res.on("end", () => {
                console.log("End of response.");
                console.log(resData);
                resolve(resData);
            });
        });

        req.on("error", (e) => {
            console.error(`Problem with request: ${e.message}`);
            reject(e);
        });

        req.write(config.postData);
        req.end();
    })
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

                const https = require("https");
                const fs = require("fs");

                const img = fs.createWriteStream(`${csInterface.getSystemPath(SystemPath.EXTENSION)}/tmp${curSearch.image.substr(curSearch.image.lastIndexOf("/"))}`);
                const request = https.get(curSearch.image, function(response) {
                    response.pipe(img);

                    img.on("finish", () => {
                        curSearch.imgPath = img.path;
                        img.close();
                    });
                });

            } catch(e) {
                console.error(e);
            }
        }

    }
}


let dbConCompany;
let dbConProjects;

function dbInit() {
    const mysql = require("mysql");

    let dbPass = "placeholder";

    dbConCompany = mysql.createPool({
      host: "gndgn.dev",
      user: "rpaidtpUser",
      password: dbPass,
      database: "rpaidtp_cs_companyDb"
  });

    dbConProjects = mysql.createPool({
      host: "gndgn.dev",
      user: "rpaidtpUser",
      password: dbPass,
      database: "rpaidtp_cs_productsDb"
  });
}


function loadDbDataComp() {
    return new Promise((resolve, reject) => {
        let q = `SELECT artno, prodname, prodvar FROM projects WHERE jobno=${curSearch.jobno}`;

        dbConCompany.query(q, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            resolve(result);
        });
    })
}


function loadDbDataProj() {
    return new Promise((resolve, reject) => {
        let q = `SELECT descr FROM products WHERE artno='${curSearch.artno}'`;

        dbConProjects.query(q, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            resolve(result);
        });
    })
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

    csInterface.openURLInDefaultBrowser(s);
}


function openPath(p) {
    p = "/";

    require("child_process").exec(`open ${p}`);
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

function buildXml() {
    const { create } = require("xmlbuilder2");

    const root = create({ version: "1.0" })
    .ele("Root")
    .ele("product")
    .ele("details")
    .ele("jobno").txt(curSearch.jobno).up()
    .ele("artno").txt(curSearch.artno).up()
    .ele("name").txt(curSearch.name).up()
    .ele("brand").txt(curSearch.brand).up()
    .ele("suppl").txt(curSearch.suppl).up()
    .ele("conMerch").txt(curSearch.conMerch).up()
    .ele("conSupp").txt(curSearch.conSupp).up()
    .ele("delivery").txt(curSearch.delivery).up()
    .ele("desc").txt(curSearch.desc).up()
    .ele("comments").txt(curSearch.comments).up()
    .ele("status").txt(curSearch.status).up()
    .ele("idPmsys").txt(curSearch.idPmsys).up()
    .ele("image").txt(curSearch.image).up();

    const xml = root.end({ prettyPrint: true });

    let p = require("os").homedir() + `/Desktop/${curSearch.artno}.xml`;

    require("fs").writeFile(p, xml, { flag: "w" }, function (err) {
        if (err) throw err;
        alert(`XML-Datei exportiert in: ${p}`)
    });
}


function vmCallback(message) {
    let m = VulcanInterface.getPayload(message);
    eval(m);
};


csInterface.evalScript(`$.evalFile('${csInterface.getSystemPath(SystemPath.EXTENSION)}/jsx/helper-csMware.jsx');`);


VulcanInterface.addMessageListener(VulcanMessage.TYPE_PREFIX + "csMware", vmCallback);

let vmIdsn = new VulcanMessage(VulcanMessage.TYPE_PREFIX + "csMware", "IDSN", "19.3");
let vmPhxs = new VulcanMessage(VulcanMessage.TYPE_PREFIX + "csMware", "PHXS", "25.5.1");
let vmIlst = new VulcanMessage(VulcanMessage.TYPE_PREFIX + "csMware", "ILST", "28.3.0");


function generateAssets(type) {
    switch(type) {

    case "pdf":
        vmIdsn.setPayload(`csInterface.evalScript('generatePdfSheet(${JSON.stringify(curSearch)});');`);
        VulcanInterface.dispatchMessage(vmIdsn);
        break;

    case "web":
        vmPhxs.setPayload(`csInterface.evalScript('generateWebImages(${JSON.stringify(curSearch)});');`);
        VulcanInterface.dispatchMessage(vmPhxs);
        break;

    case "badge":
        vmIlst.setPayload(`csInterface.evalScript('generateBadge(${JSON.stringify(curSearch)});');`);
        VulcanInterface.dispatchMessage(vmIlst);
        break;
    }
}

