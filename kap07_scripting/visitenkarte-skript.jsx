var csv = File("visitenkarte-stammdaten.csv");
csv.open("r");

var csvData = csv.read().split("\n");

for(i=0; i<csvData.length; i++) {
    csvData[i] = csvData[i].split(";");
}

var doc = app.documents.add();
doc.documentPreferences.pageHeight = "55mm";
doc.documentPreferences.pageWidth = "85mm";
doc.pages[0].marginPreferences.properties = { 
    top: "6mm", left: "6mm", right: "6mm", bottom: "6mm" 
};

var img = doc.pages[0].rectangles.add({
    geometricBounds: ["5mm", "40mm", "17mm", "81mm"]
});

var imgfile = new File("visitenkarte-logo.pdf");
img.place(imgfile);
img.fit(FitOptions.PROPORTIONALLY);

var tf1 = doc.textFrames.add({geometricBounds: ["30mm", "6mm", "55mm", "40mm"]});
var tf2 = doc.textFrames.add({geometricBounds: ["30mm", "42.5mm", "55mm", "79mm"]});
var tfs = doc.textFrames;

for(i=0; i<tfs.length; i++) {
    var txt = tfs[i].texts[0];
    txt.appliedFont = app.fonts.itemByName("Myriad Pro");
    txt.appliedLanguage = "Deutsch: 2006 Rechtschreibreform";
    txt.fontStyle = "Regular";
    txt.justification = Justification.LEFT_ALIGN;
    txt.leading = "9.5pt";
    txt.pointSize = "7.5pt";
}

for(j=1; j<csvData.length; j++) {
    tf1.contents = csvData[j][2] + " " + csvData[j][1] + "\r" + csvData[j][3];
    tf1.texts[0].fontStyle = "Regular";
    tf1.texts[0].pointSize = "7.5pt";
    tf1.paragraphs[0].fontStyle = "Bold";
    tf1.paragraphs[0].pointSize = "9pt";

    tf2.contents = "Unternehmen GmbH\rStraße 123\r45678 Ort\r";
    tf2.contents += "Tel.: " + csvData[j][5] + "\r"
    tf2.contents += "Mobil: " + csvData[j][6] + "\r";
    tf2.contents += "E-Mail: " + csvData[j][4];
    tf2.paragraphs[0].fontStyle = "Bold";
    tf2.texts[0].baselineShift = "-2pt";

    app.activeDocument.exportFile(ExportFormat.pdfType, 
        File("output/" + csvData[j][1] + csvData[j][2] + "_" + csvData[j][0] + "_Visitenkarte.pdf"), 
        false, 
        app.pdfExportPresets.item("[PDF/X-4:2008]")
        );
}

app.activeDocument.close(SaveOptions.NO);
