const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 9999;

app.use(cors());
app.use(express.json());

let dbPass = "placeholder";

const dbConCompany = mysql.createPool({
  host: "gndgn.dev",
  user: "rpaidtpUser",
  password: dbPass,
  database: "rpaidtp_cs_companyDb"
});

const dbConProjects = mysql.createPool({
  host: "gndgn.dev",
  user: "rpaidtpUser",
  password: dbPass,
  database: "rpaidtp_cs_productsDb"
});

app.post("/loadDbDataComp", (req, res) => {
  dbConCompany.query(req.body.query, (err, results) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.post("/loadDbDataProj", (req, res) => {
  dbConProjects.query(req.body.query, (err, results) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.post("/buildXml", (req, res) => {
  let curSearch = req.body;

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
    console.log(`XML-Datei exportiert in: ${p}`)
  });
});


app.listen(port, () => {
  console.log(`Server gestartet: http://localhost:${port}`);
});


