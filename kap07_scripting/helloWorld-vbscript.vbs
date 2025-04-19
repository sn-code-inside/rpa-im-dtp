main

Function main()
	Set app = CreateObject("InDesign.Application.2023")
	app.Activate

	Set doc = app.Documents.Add

	With doc.DocumentPreferences
		.pageWidth = "100mm"
		.pageHeight = "100mm"
	End With

	Set p = doc.Pages.Item(1)
	Set tf = p.TextFrames.Add

	With tf
		.GeometricBounds = Array("20mm", "20mm", "30mm", "80mm")
		.Contents = "Hello world!"
	End With

End Function
