var onDeviceReady = function() {
    $('#devready').html("OnDeviceReady <strong>fired</strong>.");
};

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}

$('#page-home').live('pageinit', function(event){
    $('#sampleButton').click(function() {
       alert("Sample Button fires an alert."); 
    });
});