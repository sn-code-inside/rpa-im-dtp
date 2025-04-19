let csInterface = new CSInterface();

document.getElementById("docTitle").innerHTML = window.document.URL.substring(window.document.URL.lastIndexOf("/")+1, window.document.URL.length);

let hostColors = csInterface.hostEnvironment.appSkinInfo.appBarBackgroundColor.color;

document.body.style.background = `rgba(${hostColors.red}, ${hostColors.green}, ${hostColors.blue}, 1)`;

function vulcanMesssageCallback (message) {
    let m = VulcanInterface.getPayload(message);
    csInterface.evalScript(`alert('Nachricht vom Typ ${VulcanMessage.TYPE_PREFIX}cepTestZwei: ${m} ${csInterface.hostEnvironment.appName}.')`);
};

VulcanInterface.addMessageListener(VulcanMessage.TYPE_PREFIX + "cepTestZwei", vulcanMesssageCallback);
