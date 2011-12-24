var onDeviceReady = function() {
    document.getElementById("devready").innerHTML = "OnDeviceReady fired.";
};

function sampleButton() {
    alert("Sample Button fires an alert.");
}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}