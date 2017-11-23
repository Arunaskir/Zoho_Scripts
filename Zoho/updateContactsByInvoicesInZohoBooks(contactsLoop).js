daysToOpen=0;
transformedDate="";
checkIdList=List();
currentDate=today.addDay(0);
allOfInvoicesAreNotOverdue=true;
//Header
authtoken="AuthToken";
organisationId="655712049";
//Header_end
//GetByFields
dueDate="&due_date_before=" + transformedDate;
contact="&contact_name=";
customFunction="&cf_status=On Hold";
customer_id="&customer_id=";
overdue="&status=overdue";
//GetByFields_end
//Override method and update fields
updateMap=map();
updateFields=map();
updateList=List();
updateFields.put("label","Status");
updateFields.put("value","Open");
updateList.add(updateFields);
updateMap.put("custom_fields",updateList);
info updateMap;
m=map();
m.put("Authorization","Zoho-authtoken " + authtoken);
m.put("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
m.put("X-HTTP-Method-Override","PUT");
jString="{\"cf_status\": \"On Hold\"}";
mString=map();
uString="?JSONString=" + updateMap;
//Override_end
resp = getUrl("https://books.zoho.com/api/v3/contacts?authtoken=" + authtoken + "&organization_id=" + organisationId + customFunction);
//info resp;
listOfResp=resp.getJSON("contacts");
emptyMap=map();
for each elem in listOfResp.toJSONList()
{
	contactId=elem.getJSON("contact_id");
	contactName=elem.getJSON("contact_name");
	if(contactName  ==  "Test Account")
	{
		resp = getUrl("https://books.zoho.com/api/v3/invoices?authtoken=" + authtoken + "&organization_id=" + organisationId + customer_id + contactId + overdue);
		info resp;
		invoices=resp.getJSON("invoices");
		for each invoice in invoices.toJSONList()
		{
			due_date=(invoice.getJSON("due_date")).toDate();
			dateEvaluation=days360(currentDate,due_date);
			if(dateEvaluation  <=  daysToOpen)
			{
				allOfInvoicesAreNotOverdue=false;
			}
			info "=====================================";
		}
		if(allOfInvoicesAreNotOverdue)
		{
			response = postUrl("https://books.zoho.com/api/v3/contacts/" + contactId + uString,mString,m,false);
			info response;
		}
		allOfInvoicesAreNotOverdue=true;
	}
}
