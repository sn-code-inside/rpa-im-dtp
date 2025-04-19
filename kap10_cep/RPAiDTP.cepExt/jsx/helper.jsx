function getDocPages() {
    return String(app.activeDocument.pages.length);
}

function returnNumJsx() {
    $.writeln("Test");
    return 1984;
}

function returnNumAsStringJsx() {
    return String(1984);
}

function exchangeDataJsx(data, type) {

    // alert(data["b"]); // 2
    // alert(data[2]); // 2

    var o = "";

    if (typeof data == "object") {
        if (data.length) { // Array
            alert(typeof data + ": " + data + "\rlength: " + data.length);
        } else { // Object
            var oIndex = 0;
            var oData = "";
            for (var key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    oIndex++;
                    oData += key + ":" + data[key] + ", ";
                }
            }

            oData = oData.substr(0, oData.length - 2);

            alert(typeof data + ":" + oData + "\rlength: " + oIndex);
        }
    } else { // String, Number, Boolean
        alert(typeof data + ": " + data);
    }

    switch (type) {
    case "Boolean":
        return Boolean(data);
        break;

    case "Array":
        return "[" + String(data) + "]";
        break;

    case "Object":
        return "{'" + oData.replace(/:/g, "':'").replace(/, /g, "', '") + "'}";
        break;

    default:
        return data;
    }

}
