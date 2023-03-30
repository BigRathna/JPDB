var jpdbBaseUrl = "http://api.login2explore.com:5577";
var jpdbiml = "/api/iml";
var jpdbirl = "/api/irl";
var connToken = "90932920|-31949280850094937|90947669";


$("#shipmentId").focus();

//function to validate and get form data as JSON string
function validateAndGetFormData() {
    var shipmentIdVar = $("#shipmentId").val();
    if (shipmentIdVar === "") {
        alert("Employee ID Required Value");
        $("#shipmentId").focus();
        return "";
    }
    var descriptionVar = $("#description").val();
    if (descriptionVar === "") {
        alert("Employee Name is Required Value");
        $("#description").focus();
        return "";
    }
    var sourceVar = $("#source").val();
    if (sourceVar === "") {
        alert("Employee Salary is Required Value");
        $("#source").focus();
        return "";
    }
    var destinationVar = $("#destination").val();
    if (destinationVar === "") {
        alert("Employee HRA is Required Value");
        $("#destination").focus();
        return "";
    }
    var shippingDateVar = $("#shippingDate").val();
    if (shippingDateVar === "") {
        alert("Employee DA is Required Value");
        $("#shippingDate").focus();
        return "";
    }
    var expectedDeliveryVar = $("#expectedDelivery").val();
    if (expectedDeliveryVar === "") {
        alert("Employee Deduction is Required Value");
        $("#expectedDelivery").focus();
        return "";
    }
    var jsonStrObj = {
        shipmentId: shipmentIdVar,
        desc: descriptionVar,
        src: sourceVar,
        dest: destinationVar,
        shipDate: shippingDateVar,
        expectDelivery: expectedDeliveryVar
    };
    return JSON.stringify(jsonStrObj);

}

//when the page is loaded, disable all the fields except employee shipmentId
$(document).ready(function () {
    $("#description, #source, #destination, #shippingDate, #expectedDelivery, #save, #change, #reset").prop("disabled", true);
    $("#shipmentId").prop("disabled", false);
    $("#shipmentId").focus();
});

//function to create a insert request string
function createPUTRequest(connToken, jsonObj, dbName, relName) {
    var putRequest = "{\n"
        + "\"token\" : \""
        + connToken
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n" + "\"cmd\" : \"PUT\",\n"
        + "\"rel\" : \""
        + relName + "\","
        + "\"jsonStr\": \n"
        + jsonObj
        + "\n"
        + "}";
    return putRequest;
}

//function to create update request string
function createUpdateRequest(connToken, jsonObj, dbName, relName, rec_no) {
    var updateRequest = "{\n"
        + "\"token\" : \""
        + connToken
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n" + "\"cmd\" : \"UPDATE\",\n"
        + "\"rel\" : \""
        + relName + "\","
        + "\"jsonStr\":{ \n \"" + rec_no + "\": "
        + jsonObj
        + "}\n"
        + "}";
    return updateRequest;
}

//function to execute command on database
function executeCommand(reqString, dbBaseUrl, apiEndPointUrl) {
    var url = dbBaseUrl + apiEndPointUrl;
    var jsonObj;
    $.post(url, reqString, function (result) {
        jsonObj = JSON.parse(result);
    }).fail(function (result) {
        var dataJsonObj = result.responseText;
        jsonObj = JSON.parse(dataJsonObj);
    });
    return jsonObj;
}

//save shipment data in database
function save() {
    var jsonStr = validateAndGetFormData();
    if (jsonStr === "") {
        return;
    }
    var putReqStr = createPUTRequest(connToken, jsonStr, "SHIPME-TABLE", "COLLEGE-DB");
    jQuery.ajaxSetup({ async: false });
    var resultObj = executeCommand(putReqStr, jpdbBaseUrl, jpdbiml);
    jQuery.ajaxSetup({ async: true });
    resetData();
    alert("Employee Data Saved Successfully");
}

//update shipment data in database
function update() {
    $('#changeBtn').prop('disabled', true);
    jsonChange = validateAndGetFormData();
    var updateReqStr = createUpdateRequest(connToken, jsonChange, "SHIPME-TABLE", "COLLEGE-DB", localStorage.getItem("rec_no"));
    jQuery.ajaxSetup({ async: false });
    var resultObj = executeCommand(updateReqStr, jpdbBaseUrl, jpdbiml);
    resetData();
    alert("Employee Data Updated Successfully");
}

//Get Existing Shipment Data
function getExisting() {
    var shipmentId = GetEmpIdasJSON();
    var getReqStr = createGET_BY_KEYRequest(connToken, "SHIPME-TABLE", "COLLEGE-DB", shipmentId);
    jQuery.ajaxSetup({ async: false });
    var resultObj = executeCommand(getReqStr, jpdbBaseUrl, jpdbirl);
    jQuery.ajaxSetup({ async: true });
    if (resultObj.status === 400) {
        $("#description, #source, #destination, #shippingDate, #expectedDelivery").prop("disabled", false);
        $('#save').prop('disabled', false);
        $('#reset').prop('disabled', false);
        $('#shipmentId').focus();
    }
    else if (resultObj.status === 200) {
        $('shipmentId').prop('disabled', true);
        fillRestData(resultObj);
        $("#description, #source, #destination, #shippingDate, #expectedDelivery").prop("disabled", false);
        $('#change').prop('disabled', false);
        $('#reset').prop('disabled', false);
        $('#description').focus();
    }
}

//Get ShipmentId as JSON object to be used in GET_BY_KEY request
function GetEmpIdasJSON() {
    var shipmentId = $("#shipmentId").val();
    var jsonStr = "{\"shipmentId\" : \"" + shipmentId + "\"}";
    return jsonStr;
}

//Create GET_BY_KEY request string
function createGET_BY_KEYRequest(connToken, dbName, relName, empIdJsonObj) {
    var getRequest = "{\n"
        + "\"token\" : \""
        + connToken
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n" + "\"cmd\" : \"GET_BY_KEY\",\n"
        + "\"rel\" : \""
        + relName + "\","
        + "\"createTime\": true,\n"
        + "\"updateTime\": true,\n"
        + "\"jsonStr\": \n "
        + empIdJsonObj
        + "}";
    return getRequest;
}

//Fill the rest of the fields when GET_BY_KEY is executed
function fillRestData(resultObj) {
    saveResult(resultObj);
    var record = JSON.parse(resultObj.data).record;
    $('#description').val(record.desc);
    $('#source').val(record.src);
    $('#destination').val(record.dest);
    $('#shippingDate').val(record.shipDate);
    $('#expectedDelivery').val(record.expectDelivery);
}

//Save Record Number when GET_BY_KEY is executed
function saveResult(resultObj) {
    var temp = JSON.parse(resultObj.data);
    localStorage.setItem("rec_no", temp.rec_no);
}

//Reset Button
function resetData() {
    $("#shipmentId").val("");
    $("#description").val("").prop("disabled", true);
    $("#source").val("").prop("disabled", true);
    $("#destination").val("").prop("disabled", true);
    $("#shippingDate").val("").prop("disabled", true);
    $("#expectedDelivery").val("").prop("disabled", true);
    $("#save, #change, #reset").prop("disabled", true);
    $("#shipmentId").prop("disabled", false);
    $("#shipmentId").focus();
}