app.findGrepPreferences = app.changeGrepPreferences = null;

app.findGrepPreferences.findWhat = "\\d+ (f|ph)antastischer? Gra(f|ph)iker";
app.findGrepPreferences.appliedFont = app.fonts.itemByName("Myriad Pro\tRegular");

app.changeGrepPreferences.appliedFont = app.fonts.itemByName("Chalkboard\tBold");

app.changeGrep();