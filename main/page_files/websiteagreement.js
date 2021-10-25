var agreeTitle;		//Title of agreement being presented
var agreeVersion;	//Version of agreement being presented
var translations = {};//Dictionary containing translations of selected agreement
var defaultLanguage = "English";//Sets Default agreement language for agreement
var liHost = "https://www14.software.ibm.com/cgi-bin/weblap/lap.pl?li_formnum=";//Host for viewing LI numbers

var companyName;
var companyAddr1;
var companyAddr2;
var companyCity;
var companyState;
var companyZip;
var companyCountry;
var contactEmail;

var individualSign = false;
var duplicateCompany = false;
var stateList = [];
var stateDict = {};
var countryDict = {};
var invertedCountryDict = {};
var invertedStateDict = {};
var companyDetailsOptions = {};

function generateCompanyDetailsOptions (){
	companyDetailsOptions["individual"] = {
			
			"title" : "Add Company Details",
			"details" : "<b>There is no company information listed in your IBMid profile</b> ",
			
			"options" : {
				"updateCompany" : {
					"text" : "Add company information to your profile",
					"info" : "Select this option if you'd like to add company details to your IBMid profile.",
					"radioClass" : "updateCompanyClass",
					"buttonText" : "Next",
					"visible" : true,
					"default" : true
				},
				"setIndividual" : {
					"radioClass" : "setIndividualClass",
					"visible" : false
				},
				"continue" : {
					"text" : "Continue with missing information ",
					"info" : "",
					"radioClass" : "continueClass",
					"buttonText" : "Next",
					"visible" : true
				}
			}
	}
	
	
	
	companyDetailsOptions["company"] = {
			
			"title" : "Verify Company Details",
			"details" : "You are signing this agreement on behalf of the company ",
			
			"options" : {
				"updateCompany" : {
									"text" : "Update Company and/or Contact Details",
									"info" : "Changes made here will be written to your IBMid Profile",
									"radioClass" : "updateCompanyClass",
									"buttonText" : "Next",
									"visible" : true
									},
				"setIndividual" : {
									"text" : "Sign as Individual",
									"info" : "Select this option if you'd like to sign on behalf of yourself as an individual instead of your company.  " +
												"This option will NOT alter your IBMid Profile in any way",
									"radioClass" : "setIndividualClass",
									"buttonText" : "Submit",
									"visible" : false
									},
				"continue" : {
								"text" : "Continue Without Updating",
								"info" : "",
								"radioClass" : "continueClass",
								"buttonText" : "Next",
								"visible" : true,
								"default" : true
									}
			}
	}
}

function addCountry( code, name ){
	countryDict[code] = name;
	invertedCountryDict[name] = code;
}

function addState( code, name ){
	stateDict[code] = name;
	invertedStateDict[name] = code;
}

function addTranslation( translateId, historyId, agreementId, language, text, title, version) {
	
	var languageDict = {
			"translateId" : translateId,
			"language" : language,
			"text"	: text,
			"title" : title,
			"version" : version
	};
	
	translations[language] = languageDict;
	
}

//Checks to ensure user can proceed with agreement
function checkAgreement(){
	
	//Gets value of "I agree" checkbox
	var agreementAccepted = $("#agreeCheckBox").is(":checked");
	
	//Opens correct overlay depending on value
	if ( agreementAccepted == false ){
		IBMCore.common.widget.overlay.show('confirmOverlay');
		return false;
	} else {
		window.location.href='../containers/index.html';
		return true;
	}
}


//Submits agreement form
function submitAgreement() {
	$("#individualSign").val(individualSign);
	$("#agreementForm").submit();
}


//Populates agreement text area with correct information
function fillAgreementText( agreementText, agreementTitle, agreementVersion, liNumber ){
	
	//Gets text area and global values
	var agreementTextArea = $("#agreementTextArea");
	
	agreeTitle = agreementTitle;
	agreeVersion = agreementVersion;
	
	
	//Populates text area with iframe showing agreement if 
	//the page is using an LI number
	if( liNumber != null && liNumber != "" ){
		agreementTextArea.append(
				"<iframe id='iFrame' width='100%' height='90%' " + 
					"src='" + liHost + liNumber + "'></iframe>");
		
		
	//Otherwise, insert properly formatted agreement 
	//text into text area
	} else {
		
		agreementTextArea.append( "<p class='ibm-h3'> " + agreeTitle + " </p><p>" + agreementText + "</p> " +
				"<p>" + agreeTitle + " (" + agreeVersion + ")</p") ;
		
		var languageDict = {
				"translateId" : 0,
				"language" : defaultLanguage,
				"text"	: agreementText,
				"title" : agreeTitle,
				"version" : agreeVersion
		};
		
		translations[defaultLanguage] = languageDict;
		
	}
}


//
function saveAgreement(){
	$("#agreementTextArea").printElement();
}


//Gets current date in month/day/year format
function getDate() {
	
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	
	return month + "/" + day + "/" + year;
}

function openUpdateDetailsWindow(){
	
	resetUpdateForm();
	$("#individualSign").prop("checked", false);
	
	$("#contactEmailInput").val(contactEmail);
	//$(".companyDropdown").next().width( $("#companyNameInput").width() + "px");
	
}

function resetUpdateForm(){
	
	$("#individualSign").off();
	$(".companyFormElem").off();
	$("#closeDetailsEdit").text("Cancel");
	
	$(".companyFormElem").prop("disabled", false);
	
	$(".updateMessage").text("");
	$(".updateMessage").hide();
	$("#updateSpinner").hide();
	
	$("#companyNameInput").val(companyName);
	$("#companyAddr1Input").val(companyAddr1);
	$("#companyAddr2Input").val(companyAddr2);
	$("#companyCityInput").val(companyCity);
	
	$("#companyZipInput").val(companyZip);
	
	
	
	IBMCore.common.widget.overlay.show('companyDetailsEditOverlay');
	
	if(!$("#companyCountryInput").hasClass('.select2-offscreen')){
		$("#companyCountryInput").select2(
				{ 	minimumResultsForSearch : 6,
					placeholder: "Select a Country",
						width : $("#companyNameInput").width() + "px"
					});
		
		$("#companyCountryInput").change(function() { 
			
			updateStateDropdown()
		});
	}
	
	
	if(!$("#companyStateInput").hasClass('.select2-offscreen')){
		$("#companyStateInput").select2(
				{ 	minimumResultsForSearch : 6,
					placeholder: "Select a state",
					width : $("#companyNameInput").width() + "px"
				});
	}
	
	
	
	
	
	updateCountryDropdown();
	$("#companyCountryInput").val(companyCountry).trigger("change");
	$("#companyStateInput").val(companyState).trigger("change");
	
	if ( companyName != null && companyName.trim() != ""){
		$("#individualSignParagraph").show();
		$("#individualSign").change(function(){ 
			resetUpdateForm();
			$(".companyFormElem").prop("disabled", $(this).is(':checked'));
		});
	} else {
		$("#individualSignParagraph").hide();
	}
	
	
	$(".companyFormElem").change(function() { 
		$("#saveDetails").text("Save Details");
	});
	
	
	$("#resetForm").click(function(){
		
		$("#companyNameInput").val(companyName);
		$("#companyAddr1Input").val(companyAddr1);
		$("#companyAddr2Input").val(companyAddr2);
		$("#companyCityInput").val(companyCity);
		
		$("#companyZipInput").val(companyZip);
		
		$("#companyCountryInput").val(companyCountry).trigger("change");
		$("#companyStateInput").val(companyState).trigger("change");
		$("#contactEmailInput").val(contactEmail);
		
	});
	
	
}


function updateCountryDropdown(){
	
	$("#companyCountryInput").select2("data" , null, true);
	
	var orderedKeys = Object.keys(invertedCountryDict).sort();
	
	$("#companyCountryInput").append("<option value='" + null + "'>Select a Country</option>");
	
	for( var i = 0; i < orderedKeys.length;  i ++ ){
		var name = orderedKeys[i];
		var code = invertedCountryDict[name];
		
		$("#companyCountryInput").append("<option value='" + code + "'>" + name + "</option>");
	}
	
}

function updateStateDropdown(){
	
	$("#companyStateInput").empty();

	var orderedKeys = Object.keys(stateDict).sort();
	
	$("#companyStateInput").append("<option value='" + null + "'>Select a State or Province</option>");

	
	var countryVar = $("#companyCountryInput").val();
	stateList = [];
	
	for( var i = 0; i < orderedKeys.length;  i ++ ){
		var code = orderedKeys[i];
		var name = stateDict[code];
		//console.log(code.substring(0,2));//DEBUG
		if ( code.substring(0,2) == countryVar ){
			stateList.push(code);
			//stateList.push({"id": code, "text" : name, "element" : "HTMLOptionElement" });
			$("#companyStateInput").append("<option value='" + code + "'>" + name + "</option>");
		}
	}
	
}



function updateCompanyDetails(){
	
	//Gets elements in form
	var updatedCompanyName = $("#companyNameInput");
	var updatedCompanyAddr1 = $("#companyAddr1Input");
	var updatedCompanyCity = $("#companyCityInput");
	var updatedCompanyState = $("#companyStateInput");
	var updatedCompanyZip = $("#companyZipInput");
	
	var updatedCompanyCountry = $("#companyCountryInput");
	var updatedContactEmail = $("#contactEmailInput");
	
	//Gets values of elements in form
	var websiteId = $("#websiteId").val();

	var updatedCompanyNameVal = $("#companyNameInput").val();
	var updatedCompanyAddr1Val = $("#companyAddr1Input").val();
	var updatedCompanyCityVal = $("#companyCityInput").val();
	var updatedCompanyStateVal = $("#companyStateInput").val();
	var updatedCompanyZipVal = $("#companyZipInput").val();
	
	var updatedCompanyCountryVal = $("#companyCountryInput").val();
	var updatedContactEmailVal = $("#contactEmailInput").val();
	
	
	var $notifMessage = null;
	var $successElement = $("#updateSuccessMessage");
	var $errorElement = $("#updateErrorMessage");
	var $notifMessage = $successElement;
	
	var responseMessage;
	
	individualSign =  $("#individualSign").is(":checked");
	if ( individualSign ){
		$("#individualSignFinal").val(individualSign);
	}
	
	var validCompanyInfo = validateCompanyEdit( updatedCompanyName, updatedCompanyAddr1, 
							updatedCompanyCity, updatedCompanyState, updatedCompanyZip, updatedCompanyCountry, updatedContactEmail );
	
	if ( validCompanyInfo["valid"] == false ){
		$notifMessage = $errorElement;
		responseMessage = validCompanyInfo["message"];
		showNotificationMessage( $notifMessage, responseMessage);
		return;
	}
	
	if (updatedCompanyNameVal == companyName 
			&& updatedCompanyAddr1Val == companyAddr1
				&& updatedCompanyCityVal == companyCity
					&& updatedCompanyStateVal == companyState
						&& updatedCompanyZipVal == companyZip
							&& updatedCompanyCountryVal == companyCountry
								&& updatedContactEmailVal == contactEmail ){
		
		IBMCore.common.widget.overlay.hide('companyDetailsEditOverlay', true);
		
		return;
		/*
		if (individualSign == false ){
			
			$notifMessage = $errorElement;
			responseMessage = "Please enter an update to your profile";
			
			console.log("individual sign is false");//DEBUG
			
		} else {
			setIndividual(false);
			$notifMessage = $successElement;
			responseMessage = "Now signing on behalf of " + updatedCompanyName;
			console.log("individual sign is true");//DEBUG

		}
		
		showNotificationMessage( $notifMessage, responseMessage);
		return;*/
	}
		
	
	$.ajax();
	jQuery.ajax();
	
	$("#updateSpinner").show();
	
	//ADD AJAX to add tab to db
	
	$.ajax({
		type: "POST",
		url: "profileupdate_action.wss",
		data : {
			"action" : "updateAgreeCompany",
			"companyName" : updatedCompanyNameVal,
			"address1" : updatedCompanyAddr1Val,
			"city" : updatedCompanyCityVal,
			"state" : updatedCompanyStateVal,
			"zipCode" : updatedCompanyZipVal,
			"companyCountry" : updatedCompanyCountryVal,
			"email" : updatedContactEmailVal,
			"siteId" : websiteId
			
		},
		
		//If successfully posted, get created id
		success: function(response){
			var success = true; 
			
			
			if (success) {
				var responseJson = $.parseJSON(response);
				
				responseMessage = response;
				
				
				if ('OK' in responseJson){
					
					if ( duplicateCompany ){
						location.reload();
					}
					
					companyName = updatedCompanyNameVal;
					companyAddr1 = updatedCompanyAddr1Val;
					companyCity = updatedCompanyCityVal;
					companyState = updatedCompanyStateVal;
					companyZip = updatedCompanyZipVal;
					
					companyCountry = updatedCompanyCountryVal;
					contactEmail = updatedContactEmailVal;
					
					responseMessage = 'Successfully updated IBMid profile';
					
					
					$("#saveDetails").text("Continue");
					
					//Shows updated message for two seconds
					setTimeout(function() {
						$successElement.fadeOut().empty();
						//IBMCore.common.widget.overlay.hide('companyDetailsEditOverlay', true);
					}, 5000);
					
					setIndividual(false);

				} else if ('ERROR' in responseJson ){
					
					$notifMessage = $errorElement;
					responseMessage = responseJson['ERROR'];
					
					// TODO: remove for IC temp fix
					var websiteIdTemp = $("#websiteId").val();
					if (websiteIdTemp == '609') {
						IBMCore.common.widget.overlay.hide('companyDetailsEditOverlay', true);
					}
					
				}
			
				$("#updateSpinner").hide();
				showNotificationMessage( $notifMessage, responseMessage );
				
			}
		},
		error: function (msg) {
			$("#updateSpinner").hide();
			$errorElement.text($.parseJSON(msg).ERROR);
			$errorElement.show();

		}
	});
	
}

function showNotificationMessage( messageElement, message ){
	
	messageElement.text(message);
	messageElement.show();
	
	//Shows updated message for two seconds
	setTimeout(function() {
		messageElement.fadeOut().empty();
	}, 5000);
	
}

function selectSignOption(){
	var optionSelected = $("input[name='companyAction']:checked").val();

	IBMCore.common.widget.overlay.hide('companyDetailsOverlay', true);
	
	switch (optionSelected){
	case "updateCompany":
		openUpdateDetailsWindow();
		break;
		
	case "setIndividual":
		setIndividual(true);
		break;
	case "continue":
		break;
	}
}

function setIndividual( val ){
	individualSign = val;
	$("#individualSignFinal").val(val);
}

function setCompanyOptions(){
	$("input[name=companyAction]").off();
	$("input[name=companyAction]").attr("checked", false);
	$("#detailsForm input").removeClass("ibm-field-error");
	
	$("#submitSignButton").hide();
	
	$("#companyNameInput").off();
	
	var companyDetailsKeyword;
	
	 $("#companyNameInput").focusout(function(){ 
		 checkCompany();
	 });
	
	
	if (companyName == null || companyName == "" || individualSign == true ){
		companyDetailsKeyword = "individual";
	
	} else {
		companyDetailsKeyword = "company";
		
		openUpdateDetailsWindow();
		$("#closeDetailsEdit").hide();
		
		 // hide weird double dropdown issue
		 //setTimeout(function() {
			 $("#countrySpan").find('.select2-container').eq(1).hide();
			 $("#stateSpan").find('.select2-container').eq(1).hide();
		 //}, 250);
		
		return;
	}
	
	
	var companyDict = companyDetailsOptions[companyDetailsKeyword];
	
	var radioOptions = companyDict["options"];
	
	$("input[name=companyAction]").on("change", function(){ 
		 
		 var optionSelected = this.value;
		 var infoText = radioOptions[optionSelected]["info"];
		 var buttonText = radioOptions[optionSelected]["buttonText"];
		 
		 $("#submitSignButton").show();
		 $("#submitSignButton").text(buttonText);
			
		 $("#selectionInfo").text(infoText);
	 });
	 
	
	
	for (option in radioOptions){
		var radioClass = radioOptions[option]["radioClass"];
		
		if ( radioOptions[option]["visible"] ){
			$("." + radioClass).html(radioOptions[option]["text"]);
			$("." + radioClass).show();
		} else {
			$("." + radioClass).hide();
		}
		
		if ( radioOptions[option]["default"] ) {
			$("." + radioClass ).prop("checked", true).trigger("change");
		}
	}
	
	
	var overlayTitle = companyDict["title"];
	var companyText = companyDict["details"];
	
	if ( companyDetailsKeyword == "company" ){
		companyText += "<b>" + companyName + "</b>";
	}

	$("#companyMessage").html(companyText);
	$("#companyDetailsTitle").html(overlayTitle);
	 
	//$("#continueOption").prop("checked", true).change(); Resets default
	IBMCore.common.widget.overlay.show('companyDetailsOverlay');
	 
}


function checkCompany(){
	
	var updatedCompanyName = $("#companyNameInput").val();
	var websiteId = $("#websiteId").val();
	
	$.ajax();
	jQuery.ajax();
	
	//ADD AJAX to add tab to db
	
	$.ajax({
		type: "POST",
		url: "profileupdate_action.wss",
		data : {
			"action" : "checkSigned",
			"companyName" : updatedCompanyName,
			"siteId" : websiteId
		},
		
		//If successfully posted, get created id
		success: function(response){
			var success = true; 
			
			
			if (success) {
				var responseJson = $.parseJSON(response);
				
				responseMessage = response;
				
				if ('OK' in responseJson){

					if (responseJson['OK'] == "true"){
						duplicateCompany = true;
						alert('This company already has an agreement in place for this website.  If you continue with this company name, you will be immediately redirected to the site, as a new agreement does not need to be signed.');
						//IBMCore.common.widget.overlay.show('confirmCompanyOverlay');
					} else {
						duplicateCompany = false;
					}

				} else if ('ERROR' in responseJson ){
					
					duplicateCompany = false;
					$notifMessage = $errorElement;
					responseMessage = responseJson['ERROR'];
					showNotificationMessage( $notifMessage, responseMessage );
				}
			

			}
		},
		error: function (msg) {
			$errorElement.text($.parseJSON(msg).ERROR);
			$errorElement.show();

		}
	});

}

function validateEmail( email ) {
	var validEmail = false;
	var message = null;
	
	if ( email!= null && email.trim() != "" ){
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		validEmail = emailReg.test( email );
	}
	
	if (!validEmail)
		message = "Email is not valid";
	
	return {"valid" : validEmail, "message" : message};
}

function validateState( state ){
	var validState = true;
	var message = null;
	if (state == null || state =="" || state=="null"){
		if ( stateList.length > 0 ){
			validState = false;
			message = "Please select a state/province";
		}
			
	}
	return {"valid" : validState, "message" : message};
}

function validateTextInput ( inputVal, inputName ) {
	var validText = false;
	var message = "Please enter a valid " + inputName;
	
	if ( inputVal != null && inputVal.trim() != "" && inputVal != "null" ){
		validText = true;
		message = null;
	}
	
	return {"valid" : validText, "message" : message};
}

//Validates company edit form
function validateCompanyEdit( nameVal, addrVal, cityVal, stateVal, zipVal, countryVal, emailVal ){
	
	var validform = {"valid" : true};
	
	//Sets input values and names for each input
	var entriesList = [
						{ "input" : nameVal, "inputName" : "Company Name"},
						{ "input" : addrVal, "inputName" : "Street Address"},
						{ "input" : cityVal, "inputName" : "City"},
						{ "input" : zipVal, "inputName" : "Zip Code"},
						{ "input" : countryVal, "inputName" : "Country"},
						{ "input" : emailVal, "inputName" : "Contact Email"}
						]
	
	//Validates text inputs
	for ( var i = 0; i < entriesList.length; i ++){
		var entry = entriesList[i];
		var input = entry["input"];
		var inputName = entry["inputName"];
		
		var entryValidation = validateTextInput( input.val(), inputName);
		
		if ( entryValidation["valid"] == false){
			validform = entryValidation;
			input.addClass("ibm-field-error");
		} else {
			input.removeClass("ibm-field-error");
		}
	}
	
	//Validates state input
	var validState = validateState(stateVal.val())
	if ( validState["valid"] == false  )
		validform = validState;
	
	//Validates email input
	var validEmail = validateEmail(emailVal.val());
	if ( validEmail["valid"] == false  )
		validform = validEmail;
	
	
	return validform;
	
	
}

function returnToMenu(){
	IBMCore.common.widget.overlay.hide('companyDetailsEditOverlay', true);
	setCompanyOptions();
}

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

//Main function executed on page load
$(document).ready(function() {	
	
	
	$("#countrySpan").append("<select id='companyCountryInput' class='companyFormElem'></select>");
	$("#stateSpan").append("<select id='companyStateInput' class='companyFormElem'></select>");
	
	$('#agreeCheckBox').prop('checked', false);
	
	generateCompanyDetailsOptions();
	
	//Gets agreement text area
	var $agreementText = $("#agreementTextArea").find(">:first-child");
	$agreementText.addClass("agreementText");
	
	var name = $("#userName").val();
	companyName = $("#userCompanyName").val();
	companyAddr1 = $("#userCompanyAddr1").val();
	companyAddr2 = $("#userCompanyAddr2").val();
	companyCity = $("#userCompanyCity").val();
	companyState = $("#userCompanyState").val();
	companyZip = $("#userCompanyZip").val();
	companyCountry = $("#userCompanyCountry").val();
	contactEmail = $("#userContactEmail").val();
	
	$("#languageDropdown").change(function(){
		console.log('lang dropdown change');
		//console.log(translations);
		//console.log($(this));
			
		var currentTranslation = translations[$(this).val()];
		console.log(currentTranslation);
		var agreeTitle = currentTranslation["title"];
		var agreementText = currentTranslation["text"];
		var agreeVersion = currentTranslation["version"];
		
		$("#scrollWarning").show();
		$("#confirmButton").prop("disabled", true);
		
		$agreementText = $("#agreementTextArea").find(".nano-content");
		$agreementText.empty();
		
		$agreementText.append( "<p class='ibm-h3'> " + agreeTitle + " </p><p>" + agreementText + "</p> " +
				"<p>" + agreeTitle + " (" + agreeVersion + ")</p") ;
		
		$agreementText.on('scroll', function() {
			console.log('scrolling - ' + $(this)[0].scrollHeight - 15);
	        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 15) {
	        	$("#confirmButton").prop("disabled", false);
	        	$("#scrollWarning").hide();
	        	$("#confirmButton").attr("title", "You must click the 'I Agree' checkbox before proceeding");
	        }
	    });
		
		//$("#agreementTextArea").load(location.href+" #agreementTextArea>*","");
		
		//Triggers scroll in case agreement doesn't fill up textbox
		$agreementText.scrollTop(0);
		$agreementText.trigger("scroll");
		
		//$(".nano-pane").css({"display" : "block"});
		
	});
	
	
	
	
	
	//Moves agreement text are to the right
	$(".agreementText").css("padding-left", "25%");
	

	//Specifies what to do when print button is clicked
	$('.printButton').click(function () {
		
		//Initializes new jsPDF object
		var doc = new jsPDF();
		
		
		//Gets title of page and text that will be printed
		var agreementDiv = $("#agreementTextArea >:first-child").clone();
		var pageTitle = $("#ibm-pagetitle-h1").clone();
		
		//Appends the word "Agreement" to the document title
		var titleText = pageTitle.text();
		//titleText += " Agreement";
		pageTitle.text(titleText);
		
		
		//Adds two spaces to top of page
		//This is done because of difficulties defining the page dimensions 
		//in the doc.fromHTML  function called below
		agreementDiv.prepend("<header></header><header></header>");
		
		var liNumber = $("#liNumber").val();
		if ( liNumber != null && liNumber != "")
			agreementDiv.append(" Agreement LI Number: " + liNumber + "<br />" + liHost + liNumber  );
		
		//Adds appropriate footer depending on whether the user has accepted agreement terms
		if ( $(this).prop("id") == 'saveDated' ){
			if (companyName != null && companyName.trim() != "" && individualSign == false){
				agreementDiv.append("<footer align='right'><p><i> " + name + " on behalf of " + companyName + " has accepted the terms on " + getDate() + "</i> </p></footer>");
			} else {
				agreementDiv.append("<footer align='right'><p><i> " + name + " accepted the terms on their own behalf on " + getDate() + "</i> </p></footer>");

			}
		} else 
			agreementDiv.append("<footer align='right'><p><i>These are the terms as of " + getDate() + " </i></p></footer>");
	
		agreementDiv.prepend(pageTitle);
		agreementDiv.children().remove("script");
		
		
		
		//Gets document text from html and formats page
	    doc.fromHTML( agreementDiv.html(), 15, 15, {
	        'width': 170,
	        'pagesplit': true
	    });
	    
	    //Saves to pdf file
	    doc.save( titleText + '.pdf');
	});
	
	
	//Populates list of available languages in drop down
	if (Object.keys(translations).length <= 0 ){
		$("#languageDropdown").hide();
	} else {
		
		var languageList = [];
		
		for ( language in translations ){
			
			$("#languageDropdown").append("<option value='"+language+"'>"+language+"</option>");
			$('#languageDropdown').trigger('change'); 
			
			languageList.push({"id": language, "text" : language, "element" : "HTMLOptionElement" });
		}
		
	 	$("#languageDropdown").width($("#saveRaw").outerWidth());
	 
		
		$("#languageDropdown").val(defaultLanguage).change();
		
		
	}
	
	
	// TODO - work on this to remove delay
	var msToDelay = 1000;
	
	setTimeout(function() {
		$agreementText = $("#agreementTextArea").find(".nano-content");
		//Enables confirm button and hides scroll warning when user scrolls to bottom of text area
		$agreementText.on('scroll', function() {
			console.log('scrolling - ' + $(this)[0].scrollHeight - 15);
	        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 15) {
	        	$("#confirmButton").prop("disabled", false);
	        	$("#scrollWarning").hide();
	        	$("#confirmButton").attr("title", "You must click the 'I Agree' checkbox before proceeding");
	        }
	    });
		
		//Triggers scroll in case agreement doesn't fill up textbox
		$agreementText.trigger("scroll");
	}, msToDelay);
	


	$("#agreeCheckBox").change(function(){ 
		if( $(this).is(":checked") ){
			
			setCompanyOptions();
			
		}
	});
	
	//$('select').trigger("change.select2");
	//$("#companyCountryInput").change(function(){ updateStateDropdown(); });
	
	
	// fix CSD link if exists for covid stuff
	/*
	var sdaLink = $("#ibm_SDA_link").attr('href');
	$("#ibm_SDA_link").attr('href', 'javascript:;');
	
	var filteredSdaLink = sdaLink.split("&")[0];
	$("#ibm_SDA_link").click(function() {
		window.open(filteredSdaLink, '_blank');
	});
	*/
	
	// attempt to fix all links which have added get params for metrics
	setTimeout(function() {
		$("#agreementTextArea a").each(function() {
			console.log('editing this link - ' + $(this).attr('href'));
		    let unfilteredLink = $(this).attr('href');
			let filteredLink = removeParam('_ga', unfilteredLink);
			filteredLink = removeParam('cm_mc_sid_50200000', filteredLink);
			filteredLink = removeParam('cm_mc_uid', filteredLink);
			console.log('link edited - ' + filteredLink);
			$(this).attr('href', 'javascript:;');
			$(this).removeAttr('target');
			$(this).click(function() {
				window.open(filteredLink, '_blank');
			});
		});
	}, 500);
	
	
	// create back event depending on just logged in or not
	$("#cancelAgmtButton").click(function() {
		if ($("#progIdStr").val() == 'rdcrnp') {
			window.location.href = "https://www.ibm.com/it-infrastructure/z/software-trials";
		} else if (document.referrer.includes("login.w3")) {
			history.go(-6);
		} else if (document.referrer.includes("login.ibm")) {
			history.go(-3);
		} else {
			history.go(-1);
		}
	});
	
	
});

