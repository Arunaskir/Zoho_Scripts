
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
const uZohoUrlParameters = '&scope=crmapi&wfTrigger=false&duplicateCheck=1';

//******************** comments
//The function returns all Zoho Contact fields (key-value pair) for a given user by email
//
//v0.9 Initial commit
//v0.91 result.data is added

//******************** sample body

// var sZohoUserEmail - Zoho User email, as a key
// var result - undefined before callback returns the value to this var. Will return the result
//	 {onSuccess: true, message: "Zoho Contact is successfully found"};
//   {onError: true, message: "Too many Zoho Contacts are found"};
//   {onError: true, message: "Zoho Contact is not found"};
//   {onError: true, message: "Unexpected Zoho API error"};
//   {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message};
//	data - Zoho Users array (only one item for OnSuccess)

//Test Account Numbers:
//test_user0@test.com no contacts. Error
//test_user1@test.com 1 contact. Success
//test_user5@test.com a few contacts. Error

var aa = {
	result: undefined,
	sZohoUserEmail: 'romanarunas@gmail.com'
}

aaGetZohoUserByEmail(aa);

console.log(aa.result); //undefined since there has been no result yet
setTimeout(function() {console.log(aa.result)}, 7000); //there is a result after 5-7 seconds


//**************************************** functions

//******************** aaGetZohoUserByEmail
//step1. Find Zoho User (Contact) by email
function aaGetZohoUserByEmail (aa) {
  var sZohoMethod = 'searchRecords';
  var uData = '&criteria=(Email:'+aa.sZohoUserEmail+')';
  var uZohoFullUrl = uZohoUrlContactsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uData;
  request (uZohoFullUrl, cbGetContactsByEmail.bind( {aa: aa} ));
}


//******************** cbGetContactsByEmail
//step2. Callback for aaGetZohoUserByEmail

function cbGetContactsByEmail(error, response, body) {
  dataResp = JSON.parse(body);
  //console.log(body);
  var aZohoContacts = [];
  var aaZohoContactFields = {};
  var aContacts = [];
  if (dataResp.response.hasOwnProperty("result")) {
	jContacts = dataResp.response.result.Contacts.row;
	if (Array.isArray(jContacts)) {
      aContacts = jContacts;
	  aaResult = {onError: true, message: "Too many Zoho Contacts are found"};
    }
	else {
	  aContacts.push(jContacts);
	  aaResult = {onSuccess: true, message: "Zoho Contact is successfully found"};
	}
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
