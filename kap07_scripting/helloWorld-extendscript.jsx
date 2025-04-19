var doc = app.documents.add();

doc.documentPreferences.pageHeight = "100mm";
doc.documentPreferences.pageWidth = "100mm";

var p = doc.pages.item(0);

var tf = p.textFrames.add({
	geometricBounds: ["20mm", "20mm", "30mm", "80mm"],
	contents: "Hello world!"
});
