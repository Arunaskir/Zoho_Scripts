
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
//The function returns all Zoho Contact fields (key-value pair) for each user to aZohoUsers array
//The current limitation is not more than 200 users per account
//
//v0.9 Initial commit
//v0.91 result.data is added

//******************** sample body

// var aZohoUsers - Zoho Users array will be returned here
// var nZohoAccountNumber - Zoho AccountNumber, a number or a string. Should be equal to Zoho Number
// var result - undefined before callback returns the value to this var. Will return the result
//   {onSuccess: true, message: "Zoho Contacts are successfully found"};
//	 {onSuccess: true, message: "No Zoho Contacts are found"};
//   {onError: true, message: "Zoho Contact already exists"};
//   {onError: true, message: 'Too Many Zoho Accounts Found'};
//   {onError: true, message: 'Invalid Zoho Account Number'};
//   {onError: true, message: "Unexpected Zoho API error"};
//   {onError: true, message: Zoho error code + ": " + Zoho error message};
//	data - Zoho Users array

//Test Account Numbers:
//696011000000250031 no contacts
//696011000000250009 1 contact
//269601100000017202 a few contacts

var aa = {
	result: undefined,
	nZohoAccountNumber: 12345678
}

aaGetZohoUsersByAccountNumber(aa);

console.log(aa.result); //undefined since there has been no result yet
setTimeout(function() {console.log(aa.result)}, 7000); //there is a result after 5-7 seconds


//**************************************** functions

//******************** aaGetZohoUsersByAccountNumber
//step1. Find Zoho Account by Account Number
function aaGetZohoUsersByAccountNumber (aa) {
  var sZohoMethod = 'searchRecords';
  var uData = '&criteria=(Account Number:'+aa.nZohoAccountNumber+')';
  var uZohoFullUrl = uZohoUrlAccountsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uData;
  request (uZohoFullUrl, cbSearchZohoAccountByAccountNumberAndGetContacts.bind( {aa: aa} ));
	console.log(uZohoFullUrl);
}

//******************** cbSearchZohoAccountByAccountNumberAndGetContacts
//step2. Callback for aaGetZohoUsersByAccountNumber
function cbSearchZohoAccountByAccountNumberAndGetContacts(error, response, body) {
  var sAccountId = '';
  dataResp = JSON.parse(body);
  if (dataResp.response.hasOwnProperty("result")) {
    var aAccounts = dataResp.response.result.Accounts.row;
    if (Array.isArray(aAccounts)) {
      aa.result = {onError: true, message: 'Too Many Zoho Accounts Found', data: undefined};
    }
    else {
      aAccounts.FL.forEach(function (value) {
        if (value.val == 'ACCOUNTID') {
          sAccountId = value.content;
          aaGetZohoContactsByAccountId(sAccountId,aa);
        }
      });
    }
  }
  else if (dataResp.response.hasOwnProperty("nodata")) {
    console.log(dataResp);
    aa.result = {onError: true, message: 'Invalid Zoho Account Number', data: undefined};
  }
  else {
    console.log(dataResp);
    aa.result = {onError: true, message: "Unexpected Zoho API error", data: undefined};
  }
}

//******************** aaGetZohoContactsByAccountId
//step3. Zoho account is found. Get Account users

function aaGetZohoContactsByAccountId (sAccountId,aa) {
  var sZohoMethod = 'getRelatedRecords';
  var uZohoId = '&id=' + sAccountId;
  var uZohoParent = '&parentModule=' + sZohoAccountsModule;
  var uZohoUrlRange = '&fromIndex=1&toIndex=200';
  var uZohoFullUrl = uZohoUrlContactsModule + sZohoMethod + uZohoToken + uZohoParent + uZohoId + uZohoUrlParameters + uZohoUrlRange;
  request (uZohoFullUrl, cbGetZohoContactsByAccountId.bind( {aa: aa} ));

}


//******************** cbGetZohoContactsByAccountId
//step4. Callback for aaGetZohoContactsByAccountId

function cbGetZohoContactsByAccountId(error, response, body) {
  dataResp = JSON.parse(body);
  //console.log(body);
  var aZohoContacts = [];
  var aContacts = [];
  if (dataResp.response.hasOwnProperty("result")) {
	jContacts = dataResp.response.result.Contacts.row;
	if (Array.isArray(jContacts)) {
      aContacts = jContacts;
    }
	else {
	  aContacts.push(jContacts);
	}
	aContacts.forEach(function(jContact){
		var aaZohoContactFields = {};

		jContact.FL.forEach(function(jContactField){
			aaZohoContactFields[jContactField.val] = jContactField.content;

		});
		aZohoContacts.push(aaZohoContactFields);
	});
	aa.result = {onSuccess: true, message: "Zoho Contacts are successfully found", data: aZohoContacts};
  }
  else if (dataResp.response.hasOwnProperty("nodata")) {
    aa.result = {onSuccess: true, message: "No Zoho Contacts are found", data: aZohoContacts};
  }
  else if (dataResp.response.hasOwnProperty("error")) {
    aa.result = {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message, data: undefined};
  }
  else {
    aa.result = {onError: true, message: "Unexpected Zoho API error", data: undefined};
  }
}
