
//*******************consts

var request = require('request');

const sZohoAccountsModule = 'Accounts'; //Accounts
const sZohoContactsModule = 'Contacts'; //Users

const sZohoTokenWork = 'YourAuthToken';
const sZohoTokenTest = 'YourAuthToken';
const sZohoToken = sZohoTokenWork;

const uZohoToken = '?authtoken='+sZohoToken;
const uZohoUrl = 'https://crm.zoho.com/crm/private/json/';
const uZohoUrlAccountsModule = uZohoUrl + sZohoAccountsModule + '/';
const uZohoUrlContactsModule = uZohoUrl + sZohoContactsModule + '/';
const uZohoUrlParameters = '&scope=crmapi&wfTrigger=false';
const uZohoUrlParametersupdate = '&scope=crmapi';

//******************** comments
//The function update all Zoho Contact fields (key-value pair) for a given user by email
//
//v0.9 Initial commit

//******************** sample body

// var sZohoUserEmail - Zoho User email, as a key
// var result - undefined before callback returns the value to this var. Will return the result
//	 {onSuccess: true, message: "Zoho Contact is successfully found"};
//   {onError: true, message: "Too many Zoho Contacts are found"};
//   {onError: true, message: "Zoho Contact is not found"};
//   {onError: true, message: "Unexpected Zoho API error"};
//   {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message};
//	data - Zoho Users array (only when more than 1 user is found)


//Test emails
//test_user0@test.com no contacts. Error
//test_user1@test.com 1 contact. Success
//test_user5@test.com a few contacts. Error


var aaUserFields = {
	'First Name': null,
	'Last Name': "Changed",
	'Mobile': null,
	'Panel Admin Privilege': "true",
	'Last Login': null,
	'CloudGateLock': null,
	'Email': 'test4@test.com'
};

var aa = {
	result: undefined,
	sZohoUserEmail: 'test1@test.com',
	aaZohoContactFields: aaUserFields
}


aaUpdateZohoUserByEmail(aa);

console.log(aa.result); //undefined since there has been no result yet
setTimeout(function() {console.log(aa.result)}, 7000); //there is a result after 5-7 seconds


//**************************************** functions

//******************** aaUpdateZohoUserByEmail
//step1. Find Zoho User (Contact) by email
function aaUpdateZohoUserByEmail (aa) {
  var sZohoMethod = 'searchRecords';
  var uData = '&criteria=(Email:'+aa.sZohoUserEmail+')';
  var uZohoFullUrl = uZohoUrlContactsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uData;
  request (uZohoFullUrl, cbUpdateZohoUserByEmail.bind( {aa: aa} ));
}

//******************** cbUpdateZohoUserByEmail
//step2. Callback for cbUpdateZohoUserByEmail

function cbUpdateZohoUserByEmail(error, response, body) {
	var sAccountId = '';
	dataResp = JSON.parse(body);
  var aZohoContacts = [];
  var aaZohoContactFields = {};
  var aContacts = [];
  if (dataResp.response.hasOwnProperty("result")) {
	jContacts = dataResp.response.result.Contacts.row;
	if (Array.isArray(jContacts)) {
      aContacts = jContacts;
	  aaResult = {onError: true, message: "Too many Zoho Contacts are found"};

	  aContacts.forEach(function(jContact){
		aaZohoContactFields = {};
		jContact.FL.forEach(function(jContactField){
			aaZohoContactFields[jContactField.val] = jContactField.content;

		});
		aZohoContacts.push(aaZohoContactFields);
	  });
	  aaResult.data = aZohoContacts;
	  aa.result = aaResult;
    }
	else {
	  aContacts.push(jContacts);
	  aaResult = {onSuccess: true, message: "Zoho Contact is successfully found"};
     var aaFields = aa.aaZohoContactFields;
     for (var sKey in aaFields) {
       if(sKey=='Email'){
       if (aaFields.hasOwnProperty(sKey)) {
         aaCheckIfNoDublicates(aa, aaFields[sKey]);
       }
       else {
         jContacts.FL.forEach(function (jContactField) {
         if (jContactField.val == 'CONTACTID') {
           sContactId = jContactField.content;
           aaUpdateRecordByContactID(sContactId, aa);
         }
         });
       }
    }
  }

}
}
  else if (dataResp.response.hasOwnProperty("nodata")) {
    aa.result = {onError: true, message: "Zoho Contact is not found", data: undefined};
		aa.aZohoUsers = aZohoContacts;
  }
  else if (dataResp.response.hasOwnProperty("error")) {
    aa.result = {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message, data: undefined};
  }
  else {
    aa.result = {onError: true, message: "Unexpected Zoho API error", data: undefined};
  }
}


//*********************Function aaUpdateRecordByContactID
//Step3 if contact was found, update fields;

function aaUpdateRecordByContactID(sContactId, aa){
	var sZohoMethod = 'updateRecords';
	  var aaFields = aa.aaZohoContactFields;
	  for (var sKey in aaFields) {
	    if (aaFields.hasOwnProperty(sKey)) {
	      var uZohoFieldAndValue = '<FL val="'+ sKey +'">'+aaFields[sKey]+'</FL>';
	      var uZohoFieldsAndValues = uZohoFieldsAndValues + uZohoFieldAndValue;
	    }
	  }
	  var uZohoId  = '&id='+sContactId;
	  var sXmlData = '<'+sZohoContactsModule+'><row no="1">' + uZohoFieldsAndValues + '</row></'+sZohoContactsModule+'>';
	  var uData = '&xmlData='+encodeURIComponent(sXmlData);
	  var uZohoFullUrl = uZohoUrlContactsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uZohoId + uData;
	  request (uZohoFullUrl, cbUpdateRecordByContactID.bind( {aa: aa} ));
}

//*********************Function cbUpdateRecordByContactID
//Step4 Callback for aaupdateRecordByContactID

function cbUpdateRecordByContactID(error, response, body) {
	dataResp = JSON.parse(body);
  if (dataResp.response.hasOwnProperty("result")) {
	  if (dataResp.response.result.message.indexOf("update") > -1) {
	  	aa.result = {onSuccess: true, message: "Zoho Contact is updated", data: undefined};
	  }
	  else {
		aa.result = {onError: true, message: dataResp.response.result.message, data: undefined};
	  }
  }
  else if (dataResp.response.hasOwnProperty("error")) {
    aa.result = {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message, data: undefined};
  }
  else {
    aa.result = {onError: true, message: "Unexpected Zoho API error", data: undefined};
  }
}
//Step 3.5 - If Email is listed in UserFields, checks, if it does not exist in Database.
function aaCheckIfNoDublicates (aa, email) {
  var sZohoMethod = 'searchRecords';
  var uData = '&criteria=(Email:'+email+')';
  var uZohoFullUrl = uZohoUrlContactsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uData;
  request (uZohoFullUrl, cbCheckIfNoDublicate.bind( {aa: aa}));
}
//callback for aaCheckIfNoDublicates function
function cbCheckIfNoDublicate(error, response, body) {
	dataResp = JSON.parse(body);
  if (dataResp.response.hasOwnProperty("result")) {
	   aa.result = {onError: true, message: "Email is already taken", data: undefined};
  }
  else if (dataResp.response.hasOwnProperty("nodata")) {
    jContacts.FL.forEach(function (jContactField) {
    if (jContactField.val == 'CONTACTID') {
      sContactId = jContactField.content;
      aaUpdateRecordByContactID(sContactId, aa);
    }
    });
  }
  else if (dataResp.response.hasOwnProperty("error")) {
    aa.result = {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message, data: undefined};
  }
  else {
    aa.result = {onError: true, message: "Unexpected Zoho API error", data: undefined};
  }
}
