let csInterface = new CSInterface();

let hostColors = csInterface.hostEnvironment.appSkinInfo.appBarBackgroundColor.color;
let txtColor = hostColors.red < 128 ? 255 : 0;

document.body.style.background = `rgba(${hostColors.red}, ${hostColors.green}, ${hostColors.blue}, 1)`;
document.body.style.color = `rgba(${txtColor}, ${txtColor}, ${txtColor}, 1)`;

document.getElementById("colorInfo").innerHTML = `rgb(${hostColors.red}, ${hostColors.green}, ${hostColors.blue})`;