recId=input.recId_;
recId=2799110000000287001;
recIdStr_=recId.toString();
prodNr=1;
grandTotal=0.0;
//API HEADER
module_="Invoices";
sZohoTokenZohoCalls="AuthToken";
mapEmpty=map();
//API HEADER
inVoice = zoho.crm.getRecordById("Invoices",recId);
taxApply = inVoice.get("AutoCalculateTax");
if (taxApply == "true")
{
taxes = zoho.crm.getRecords("CustomModule4");
product=inVoice.get("product").toJSONList();
productBillingState=inVoice.get("Billing State");
for each billingTax in taxes
{
	if(billingTax.get("CustomModule4 Name")  ==  productBillingState)
	{
		taxPercentage=billingTax.get("TaxRate");
		taxRate=(taxPercentage.toDecimal()  /  100);
	}
}
XMLData="<" + module_ + "><row no=\"1\">";
XMLData=XMLData + "<FL val=\"Product Details\">";
for each prod in product
{
	info prod;
	tax=0.0;
	productId=(prod.getJSON("Product Id")).toLong();
	updatemap=map();
	getProduct = zoho.crm.getRecordById("Products",productId);
	if((getProduct).get("Taxable")  ==  "true")
	{
		totalAfterDiscount=(prod.getJSON(("Total After Discount"))).toDecimal();
		tax=(totalAfterDiscount  *  taxRate);
		netTotal=(totalAfterDiscount  +  tax);
		grandTotal=(grandTotal  +  netTotal);
		updatemap.put("Product Id",productId);
		updatemap.put("Tax",tax);
		updatemap.put("Net Total",netTotal);
	}
	else if((getProduct).get("Taxable")  ==  "false")
	{
		totalAfterDiscount=(prod.getJSON(("Total After Discount"))).toDecimal();
		tax=0;
		netTotal=totalAfterDiscount;
		grandTotal=(grandTotal  +  netTotal);
		updatemap.put("Product Id",productId);
		updatemap.put("Tax",tax);
		updatemap.put("Net Total",netTotal);
	}
	mapFields_=updatemap.toString();
	recMapList=mapFields_.toList();
	recMap=mapFields_.toMap();
	XMLData=XMLData + "<product no=\"" + prodNr + "\">";
	for each recList in recMapList
	{
		recField=recList.getSuffix("\"").getPrefix("\"");
		recValue=recMap.get(recField);
		xmlFieldRecording="<FL val=\"" + recField + "\">" + recValue + "</FL>";
		XMLData=XMLData + xmlFieldRecording;
	}
	prodNr=(prodNr  +  1);
	XMLData=XMLData + "</product>";
}
XMLData=XMLData + "</FL>";
XMLData=XMLData + "<FL val=\"Grand Total\">" + grandTotal + "</FL>";
XMLData=XMLData + "<FL val=\"Sub Total\">" + grandTotal + "</FL>";
XMLData=XMLData + "</row></" + module_ + ">";
url="https://crm.zoho.com/crm/private/xml/" + module_ + "/updateRecords?authtoken=" + sZohoTokenZohoCalls + "&scope=crmapi&version=2&id=" + recIdStr_ + "&wfTrigger=false&xmlData=" + XMLData;
respPost = postUrl(url,mapEmpty);
info respPost;
}
else
{
	info "Tax was applied manually";
}
