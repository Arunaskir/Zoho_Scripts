
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
//No check for mandatory fields - only Zoho side check for Last Name: no way to save a Contact (user) without Last Name.
//duplicate check is ON - only Zoho side check by emails. Contacts (users) with the same email will not be recorded with OnError

//v1.0 First version
//v1.1 Duplicate check is ON. Duplicate OnError is added.

//******************** sample body

// var aaUserFields - Zoho Fields, associative array, Field names should be exactly the same as in example below
// Date sould be a formatted string with a format either "2017-03-20" or "03/20/2017"
// var nZohoAccountNumber - Zoho AccountNumber, a number or a string. Should be equal to Zoho Number
// var result - undefined before callback returns the value to this var. Will return the result
//   {onSuccess: true, message: "Zoho Contact is successfully added"};
//   {onError: true, message: "Zoho Contact already exists"};
//   {onError: true, message: 'Too Many Zoho Accounts Found'};
//   {onError: true, message: 'Invalid Zoho Account Number'};
//   {onError: true, message: "Unexpected Zoho API error"};
//   {onError: true, message: "Unexpected Zoho updateRecords API error"};
//   {onError: true, message: Zoho error code + ": " + Zoho error message};

var aaUserFields = {
	'First Name': "Test2 ufname",
	'Last Name': "Test2 ulname",
	'Mobile': "58012345671",
	'Panel Admin Privilege': "true",
	'Last Login': "03/21/2017",
	'CloudGateLock': "test_string",
	'Email': "test_user3@test.com"
};

var aaUserFields00 = {
	'First Name': null,
	'Last Name': null,
	'Mobile': null,
	'Panel Admin Privilege': null,
	'Last Login': null,
	'CloudGateLock': null,
	'Email': null
};

var aa = {
	result: undefined,
	nZohoAccountNumber: '2799110000000227007',
	aaZohoContactFields: aaUserFields
}


aaUpdateZohoUserByAccountNumber(aa);

console.log(aa.result); //undefined since there has been no result yet
setTimeout(function() {console.log(aa.result)}, 7000); //there is a result after 5-7 seconds


//**************************************** functions

//******************** aaUpdateZohoAccountByAccountNumber
//step1. Find Zoho Account by Account Number
function aaUpdateZohoUserByAccountNumber (aa) {
  var sZohoMethod = 'searchRecords';
  var uData = '&criteria=(Account Number:'+aa.nZohoAccountNumber+')';
  var uZohoFullUrl = uZohoUrlAccountsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uData;
  request (uZohoFullUrl, cbSearchZohoAccountByAccountNumberAndAddContacts.bind( {aa: aa} ));
}

//******************** cbSearchZohoAccountByAccountNumberAndAddContacts
//step2. Callback for aaUpdateZohoUserByAccountNumber
function cbSearchZohoAccountByAccountNumberAndAddContacts(error, response, body) {
  var sAccountId = '';
  dataResp = JSON.parse(body);
  if (dataResp.response.hasOwnProperty("result")) {
    var aAccounts = dataResp.response.result.Accounts.row;
    if (Array.isArray(aAccounts)) {
      aa.result = {onError: true, message: 'Too Many Zoho Accounts Found'};
    }
    else {
      aAccounts.FL.forEach(function (value) {
        if (value.val == 'ACCOUNTID') {
          sAccountId = value.content;
          aaAddZohoContactToAccountById(sAccountId,aa);
        }
      });
    }
  }
  else if (dataResp.response.hasOwnProperty("nodata")) {
    console.log(dataResp);
    aa.result = {onError: true, message: 'Invalid Zoho Account Number'};
  }
  else {
    console.log(dataResp);
    aa.result = {onError: true, message: "Unexpected Zoho API error"};
  }
}

//******************** aaAddZohoContactToAccountById
//step3. Zoho account is found. Add a contact (user) to it

function aaAddZohoContactToAccountById (sAccountId,aa) {
  var sZohoMethod = 'insertRecords';
  var uZohoFieldsAndValues = '<FL val="ACCOUNTID">'+sAccountId+'</FL>';;
  var aaFields = aa.aaZohoContactFields;
  for (var sKey in aaFields) {
    if (aaFields.hasOwnProperty(sKey)) {
      var uZohoFieldAndValue = '<FL val="'+ sKey +'">'+aaFields[sKey]+'</FL>';
      var uZohoFieldsAndValues = uZohoFieldsAndValues + uZohoFieldAndValue;
    }
  }
  var sXmlData = '<'+sZohoContactsModule+'><row no="1">' + uZohoFieldsAndValues + '</row></'+sZohoContactsModule+'>';
  var uData = '&xmlData='+encodeURIComponent(sXmlData);
  var uZohoFullUrl = uZohoUrlContactsModule + sZohoMethod + uZohoToken + uZohoUrlParameters + uData;
  request (uZohoFullUrl, cbAddZohoContactToAccountById.bind( {aa: aa} ));

}


//******************** cbAddZohoContactToAccountById
//step4. Callback for aaAddZohoContactToAccountById

function cbAddZohoContactToAccountById(error, response, body) {
  dataResp = JSON.parse(body);
  //console.log(dataResp);
  if (dataResp.response.hasOwnProperty("result")) {
	  if (dataResp.response.result.message.indexOf("added") > -1) {
		aa.result = {onSuccess: true, message: "Zoho Contact is successfully added"};
	  }
	  else if (dataResp.response.result.message.indexOf("exist") > -1) {
	  	aa.result = {onError: true, message: "Zoho Contact already exists"};
	  }
	  else if (dataResp.response.result.message.indexOf("update") > -1) {
	  	aa.result = {onSuccess: true, message: "Zoho Contact is updated"};
	  }
	  else {
		aa.result = {onError: true, message: dataResp.response.result.message};
	  }
  }
  else if (dataResp.response.hasOwnProperty("error")) {
    aa.result = {onError: true, message: dataResp.response.error.code + ": " + dataResp.response.error.message};
  }
  else {
    aa.result = {onError: true, message: "Unexpected Zoho API error"};
  }
}
