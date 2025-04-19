function generatePdfSheet(input, notif) {

    var doc = app.documents.add({
        documentPreferences: {
            intent: DocumentIntentOptions.WEB_INTENT,
            pageWidth: "148mm",
            pageHeight: "105mm",
            orientation: PageOrientation.LANDSCAPE
        }
    });

    var rect = doc.pages[0].textFrames.add({
        geometricBounds: ["10mm", "10mm", "70mm", "70mm"]
    });

    var img = rect.place(File(input.imgPath));
    rect.fit(FitOptions.PROPORTIONALLY);

    var tfMain = doc.pages[0].textFrames.add({
        geometricBounds: ["70mm", "10mm", "94mm", "90mm"],
        contents: input.name + "\n" + input.variant
    });

    tfMain.lines[0].appliedFont = app.fonts.itemByName("Myriad Pro\tRegular");
    tfMain.lines[0].pointSize = 30;

    tfMain.lines[1].appliedFont = app.fonts.itemByName("Myriad Pro\tItalic");
    tfMain.lines[1].pointSize = 20;
    tfMain.lines[1].leading = 18;


    var tfSub = doc.pages[0].textFrames.add({
        geometricBounds: ["30mm", "80mm", "94mm", "136mm"],
        contents: "Art.-Nr.: " + input.artno + "\nMarke: " + input.brand + "\n\nBeschreibung: " + input.desc
    });

    tfSub.texts[0].appliedFont = app.fonts.itemByName("Myriad Pro\tRegular");
    tfSub.texts[0].pointSize = 12;


    tfMain.textFramePreferences.properties = tfSub.textFramePreferences.properties = {
        verticalJustification: VerticalJustification.BOTTOM_ALIGN,
        autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
        autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY
    };


    var path = "~/Desktop/" + input.artno + "_" + input.name + "_" + input.variant + ".pdf";

    doc.exportFile(ExportFormat.PDF_TYPE, new File(path));
    doc.close(SaveOptions.NO);

    if(notif) {
        alert("Export abgeschlossen\nPDF-Datenblatt exportiert in\n" + path);
    }
}


function generateWebImages(input, notif) {

    var pdfOpts = new PDFOpenOptions();
    pdfOpts.antiAlias = true;
    pdfOpts.mode = OpenDocumentMode.RGB;
    pdfOpts.resolution = 1200;
    pdfOpts.cropPage = CropToType.TRIMBOX;

    var pdf = new File("~/Desktop/" + input.artno + "_" + input.name + "_" + input.variant + ".pdf");

    app.open(pdf, pdfOpts);


    var saveOpts = new ExportOptionsSaveForWeb();
    saveOpts.format = SaveDocumentType.JPEG;
    saveOpts.quality = 80;

    var doc = app.activeDocument;

    var docWs = [1600, 1200, 900, 600];

    for(var i=0; i<docWs.length; i++) {
        var newH = Math.round(doc.height = doc.height / doc.width * docWs[i]);

        doc.resizeImage(docWs[i] + "px", newH + "px");

        var output = new File("~/Desktop/" + input.artno + "_" + input.name + "_" + input.variant + "_" + docWs[i] + "x" + newH + ".jpg");

        app.activeDocument.exportDocument(output, ExportType.SAVEFORWEB, saveOpts);
    };

    doc.close(SaveOptions.DONOTSAVECHANGES);

    if(notif) {
        alert("Export abgeschlossen\n" + docWs.length + " Grafiken exportiert in\n" + output.subst(0, output.lastIndexOf("/")));
    }
}



function generateBadge(input, notif) {

    var pdf = new File("~/Desktop/" + input.artno + "_" + input.name + "_" + input.variant + ".pdf");
    app.open(pdf);

    var doc = app.activeDocument;
    var tfs = app.activeDocument.textFrames;

    for(var i=0; i<tfs.length; i++) { 
        if( (tfs[i].contents == input.name) || (tfs[i].contents == input.variant) ){
            tfs[i].selected = true;
        } 
    }

    var output = new File("~/Desktop/" + input.artno + "_" + input.name + "_" + input.variant + ".png");

    var exOpts = new ExportOptionsPNG24();
    exOpts.antiAliasing = exOpts.transparency = true;
    exOpts.horizontalScale = exOpts.verticalScale = 300;

    doc.exportSelectionAsPNG(output, exOpts);

    doc.close(SaveOptions.DONOTSAVECHANGES);

    if(notif) {
        alert("Export abgeschlossen\nSchriftzug exportiert in\n" + output);
    }
}



