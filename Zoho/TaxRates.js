recId_=input.recId;
//you can use it to test
totaltax1=0;
totalTax=totaltax1.toDecimal();
//recId_=2799110000000247089;
invoiceTax = zoho.crm.getRecordById("Invoices",recId_);
//taxsize=invoiceTax.get("Tax");
taxes=invoiceTax.get("product");
if(taxes.contains("Sales Tax"))
{
	taxValue=2;
}
else if(taxes.contains("Vat"))
{
	taxValue=3;
}
//taxsize="1";
//recId = 2799110000000234005;
//sQBOInvoiceId = "204";
recIdStr_=recId_.toString();
invoicesDetails = zoho.crm.getRecordById("Invoices",recId_);
info invoicesDetails;
//potentialDetails = zoho.crm.getRecordById("Potentials",(invoicesDetails.get("Deal_ID")).toLong());
//info potentialDetails;
//sDistiPONumber=ifnull(potentialDetails.get("Disti PO Number"),"");
sDistiPONumber="";
///
updatemap=map();
updatemap.put("Disti PO Number",sDistiPONumber);
updateResp = zoho.crm.updateRecord("Invoices",recIdStr_,updatemap);
///
//contactDetails = zoho.crm.getRecordById("Contacts",input.crmconid);
contactDetails = zoho.crm.getRecordById("Contacts",(invoicesDetails.get("CONTACTID")).toLong());
info "Crashed after updatemap";
PaymentType=ifnull(invoicesDetails.get("Payment Type"),"");
Terms=ifnull(invoicesDetails.get("Terms"),"");
DistiPONumber=ifnull(invoicesDetails.get("Disti PO Number"),"");
info "Check here 1";
fName=ifnull(contactDetails.get("First Name"),"");
lName=ifnull(contactDetails.get("Last Name"),"");
conEMail=ifnull(contactDetails.get("Email"),"");
mstreet=ifnull(contactDetails.get("Mailing Street"),"-");
mcity=ifnull(contactDetails.get("Mailing City"),"");
mstate=ifnull(contactDetails.get("Mailing State"),"");
mzip=ifnull(contactDetails.get("Mailing Zip"),"");
mcountry=ifnull(contactDetails.get("Mailing Country"),"");
sub=ifnull(contactDetails.get("Subject"),"");
conName=fName + " " + lName;
//account name
sAccountId=ifnull(contactDetails.get("ACCOUNTID"),"");
if(sAccountId  !=  "")
{
	accountDetails = zoho.crm.getRecordById(("Accounts"),(sAccountId).toLong());
	conName=(accountDetails).get(("Account Name"));
}
//
conName=conName.trim();
CxID="";
quickBooksCompanyId=(zoho.crm.getOrgVariable("quickbooks3.companyId")).toString();
searchResponseCon = intuit.quickbooks.getRecords("zoho_quickbooks","Customer",quickBooksCompanyId,"DisplayName='" + conName + "'");
queryResponseCon=(searchResponseCon.get("QueryResponse")).toMap();
qulen=queryResponseCon.toString().length();
if(qulen  >  2)
{
	queryResponseConList=queryResponseCon.get("Customer");
	conrecordProp=queryResponseConList.toJSONList();
	for each cnid in conrecordProp
	{
		cnidMap=cnid.toMap();
		CxID=cnidMap.get("Id");
		info "old = " + CxID;
	}
}
if(CxID  ==  "")
{
	email=ifnull(contactDetails.get("Email"),"");
	phone=ifnull(contactDetails.get("Phone"),"");
	Customer_Details=map();
	Customer_Details.put("GivenName",fName);
	Customer_Details.put("FamilyName",lName);
	fullName=fName + " " + lName;
	fullName=fullName.trim();
	Customer_Details.put("FullyQualifiedName",fullName);
	Customer_Details.put("DisplayName",conName);
	Customer_Details.put("PrimaryEmailAddr",{ "Address" : email });
	Customer_Details.put("PrimaryPhone",{ "FreeFormNumber" : phone });
	createResp = intuit.quickbooks.create("zoho_quickbooks","Customer",quickBooksCompanyId,Customer_Details);
	queryResponseConList=createResp.get("Customer");
	conrecordProp=queryResponseConList.toJSONList();
	for each cnid in conrecordProp
	{
		cnidMap=cnid.toMap();
		CxID=cnidMap.get("Id");
		info "new = " + CxID;
	}
}
CxIdVal=CxID;
productDetails=invoicesDetails.get("product");
invDisc=(ifnull(invoicesDetails.get(("Discount")),"0.00")).toLong();
prolist=productDetails.toJSONList();
requiredlist=List();
disSum=0.0;
for each invItem in prolist
{
	taxsizeString=invItem.getJSON("Tax");
	info taxsizeString;
	taxsize=(taxsizeString).toDecimal();
	totalTax=(totalTax  +  taxsize);
	//info invItem;
	invItemMap=invItem.toMap();
	proName=invItemMap.get("Product Name");
	itemDesc="This is the sales description.";
	itemDesc=ifnull(invItemMap.get("Product Description"),"");
	listPrice=invItemMap.get("List Price");
	qty=invItemMap.get("Quantity");
	//nt=invItemMap.get("Net Total");
	nt=(ifnull(invItemMap.get("Net Total"),"0.0")).toDecimal();
	proAmt=(ifnull(invItemMap.get(("Total After Discount")),"0.0")).toDecimal();
	tax=(ifnull(invItemMap.get("Tax"),"0.0")).toDecimal();
	dis=(ifnull(invItemMap.get(("Discount")),"0.0")).toDecimal();
	disSum=(disSum  +  dis);
	searchResponse = intuit.quickbooks.searchRecords("zoho_quickbooks",quickBooksCompanyId,"select * from Item where name='" + proName + "'");
	info proName;
	sqr=(searchResponse.get("QueryResponse")).toString().length();
	if(sqr  <=  3)
	{
		Product_Details=map();
		Product_Details.put("Name",proName);
		Product_Details.put("Description",itemDesc);
		Product_Details.put("Active","true");
		Product_Details.put("FullyQualifiedName","Office Supplies");
		Product_Details.put("Taxable","false");
		Product_Details.put("UnitPrice",listPrice);
		Product_Details.put("Type","Service");
		Product_Details.put(("IncomeAccountRef"),{ "name" : "Sales of Product Income", "value" : "2" });
		searchResponse = intuit.quickbooks.create("zoho_quickbooks","Item",quickBooksCompanyId,Product_Details);
		s1=searchResponse.get("Item");
	}
	else
	{
		respMap=((searchResponse.get("QueryResponse")).toString()).toMap();
		s1=respMap.get("Item");
	}
	pro=s1.toJSONList();
	for each prod in pro
	{
		//info prod;
		prodMap=prod.toMap();
		recordId=prodMap.get("Id");
		proName=prodMap.get("Name");
		mymap=map();
		ItemRefmap=map();
		ItemRefmap.put("value",recordId);
		ItemRefmap.put("name",proName);
		ItemRef=map();
		ItemRef.put("ItemRef",ItemRefmap);
		ItemRef.put("Qty",qty);
		//ItemRef.put("TotalTax",tax);
		ItemRef.put("UnitPrice",listPrice);
		//
		Linemap=map();
		//Linemap.put("Disti PO Number", DistiPONumber);
		//Linemap.put("Disti PO Number", DistiPONumber);
		//Linemap.put("SalesItemLineDetail", salefield);
		//taxField.put("TotalTax","22.5");
		//taxField.put("TaxCodeRef", {"value": "TAX"});
		//taxField.put("TaxLine", {"Amount": "22.5"});
		//taxFields.add(taxField);
		//info "TOTAL TAX: " + taxFields;
		// TAX CALC
		taxFields=List();
		salefield=map();
		taxField=map();
		info "Salefield: " + salefield;
		info "TaxField: " + taxField;
		//taxsize=90;
		if(taxsize  !=  0)
		{
			salefield.put("TaxCodeRef",{ "value" : "TAX" });
		}
		SalesItemLineDetailmap=map();
		if(dis  ==  0)
		{
			SalesItemLineDetailmap.put("Amount",(nt  -  tax));
		}
		else
		{
			SalesItemLineDetailmap.put("Amount",(listPrice.toLong()  *  qty.toLong()));
		}
		SalesItemLineDetailmap.put("Description",itemDesc);
		SalesItemLineDetailmap.put("DetailType","SalesItemLineDetail");
		SalesItemLineDetailmap.put("SalesItemLineDetail",ItemRef);
		if(taxsize  !=  0)
		{
			SalesItemLineDetailmap.put("SalesItemLineDetail",salefield);
		}
		//SalesItemLineDetailmap.put("SalesItemLineDetail", {"TaxCodeRef", {"value": "TAX"}});
		requiredlist.add(SalesItemLineDetailmap);
	}
	//info "invDisc = " + invDisc;
	if(invDisc  >  0)
	{
		DiscDetailmap=map();
		discRef=map();
		mmmap=map();
		mmmap.put("name",("Discounts given"));
		mmmap.put("value",13);
		discRef.put(("DiscountAccountRef"),mmmap);
		DiscDetailmap.put(("DiscountLineDetail"),discRef);
		DiscDetailmap.put("Amount",invDisc);
		DiscDetailmap.put("DetailType",("DiscountLineDetail"));
		requiredlist.add(DiscDetailmap);
	}
}
if(disSum  !=  0)
{
	DiscDetailmap=map();
	discRef=map();
	mmmap=map();
	mmmap.put("name",("Discounts given"));
	mmmap.put("value",13);
	discRef.put(("DiscountAccountRef"),mmmap);
	DiscDetailmap.put(("DiscountLineDetail"),discRef);
	DiscDetailmap.put("Amount",disSum);
	DiscDetailmap.put("DetailType",("DiscountLineDetail"));
	requiredlist.add(DiscDetailmap);
}
info "requiredlist = " + requiredlist;
CustomerRef=map();
CustomerRef.put("value",CxIdVal);
Linemap.put("CustomerRef",CustomerRef);
if(conEMail  !=  "")
{
	Linemap.put("BillEmail",{ "Address" : conEMail });
}
else
{
	Linemap.put("BillEmail",{ "Address" : "" });
}
Linemap.put("BillAddr",{ "Line1" : mstreet, "City" : mcity, "CountrySubDivisionCode" : mstate, "PostalCode" : mzip, "Country" : mcountry });
Linemap.put("Line",requiredlist);
//customFields
customFields=List();
/*
customField=map();
customField.put("DefinitionId","1");
customField.put("Name","State");
customField.put("Type","StringType");
customField.put("StringValue","test1");
customFields.add(customField);
*/
customField=map();
customField.put("DefinitionId","2");
customField.put("Name","Disti PO Number");
customField.put("Type","StringType");
customField.put("StringValue",DistiPONumber);
customFields.add(customField);
Linemap.put("CustomField",customFields);
//
Linemap.put("CustomerMemo",{ "value" : sub });
if(Terms.contains("15"))
{
	Linemap.put("SalesTermRef",{ "value" : "2" });
}
//Linemap.put("TnxTaxDetails", {"TotalTax": "20"});
if(Terms.contains("30"))
{
	Linemap.put("SalesTermRef",{ "value" : "3" });
}
if(PaymentType.contains("Credit"))
{
	Linemap.put("AllowOnlineCreditCardPayment",true);
}
if(PaymentType.contains("ACH"))
{
	Linemap.put("AllowOnlineACHPayment",true);
}
taxField.put("TotalTax",totalTax);
taxField.put("TxnTaxCodeRef",{ "value" : taxValue });
Linemap.put(("ApplyTaxAfterDiscount"),true);
Linemap.put("TxnTaxDetail",taxField);
//Linemap.put("TxnTaxDetail",{ "TotalTax" : "22.5" });
//info "LINEMAP: " + Linemap;
//QBinvID="12345";
//update if possible
QBinvID=ifnull(invoicesDetails.get("QBO Invoice"),"");
//info "QBINVID: " + QBinvID;
//QBinvID="" for new invoice each time
QBinvID="";
if(QBinvID  !=  "")
{
	searchResponse = intuit.quickbooks.searchRecords("zoho_quickbooks",quickBooksCompanyId,"select * from Invoice where DocNumber='" + QBinvID + "'");
	//info searchResponse;
	queryResponse=(searchResponse.get("QueryResponse")).toMap();
	queryResponseList=queryResponse.get("Invoice").toJSONList();
	for each x in queryResponseList
	{
		y=x.toMap();
		id=y.get("Id");
		synToken=y.get("SyncToken");
		//get record by id
		//getIdResponse = intuit.quickbooks.getRecordById("Zoho", "Customer", "1241802285", id);
		//update
		//
		quickbooksResponse = intuit.quickbooks.update("zoho_quickbooks","invoice",quickBooksCompanyId,id,synToken,Linemap);
		info "updated one =" + quickbooksResponse;
	}
}
else
{
	quickbooksResponse = intuit.quickbooks.create("zoho_quickbooks","invoice",quickBooksCompanyId,Linemap);
	info "added one =" + quickbooksResponse;
	QBinvID=quickbooksResponse.toString().getJSON("Invoice").getJSON("DocNumber");
	//
	updatemap=map();
	updatemap.put("Subject","Invoice " + QBinvID);
	updatemap.put("QBO Invoice",QBinvID);
	updateResp = zoho.crm.updateRecord("Invoices",recIdStr_,updatemap);
	info "zoho resp =" + updateResp;
}
