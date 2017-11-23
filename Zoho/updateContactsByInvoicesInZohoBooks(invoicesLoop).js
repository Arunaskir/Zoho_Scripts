transformedDate="";
day="";
checkIdList=List();
currentDate=today;
liquidationList=List();
checkDate=currentDate.addDay(1);
day_=checkDate.getDay();
transformedDate=((((checkDate.getYear())) + "-") + (checkDate.getMonth())) + "-";
if(day_.toString().length()  ==  1)
{
	day="0" + (checkDate.getDay());
}
else
{
	day=(checkDate.getDay()).toString();
}
transformedDate=transformedDate + day;
//Header
authtoken="AuthToken";
organisationId="655712049";
//Header_end
//GetByFields
dueDate="&due_date_before=" + transformedDate;
customFunction="&cf_liquidation=true";
contact="&contact_name=";
overdue="&status=overdue";
//GetByFields_end
//Override methed and update field
updateMap=map();
emptyMap=map();
emptyList=List();
updateFields=map();
updateList=List();
updateFields.put("label","Status");
updateFields.put("value","On Hold");
updateList.add(updateFields);
updateMap.put("custom_fields",updateList);
n=map();
m=map();
m.put("Authorization","Zoho-authtoken " + authtoken);
m.put("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
n=m;
m.put("X-HTTP-Method-Override","PUT");
n.put("X-HTTP-Method-Override","GET");
jString="{\"cf_status\": \"On Hold\"}";
mString=map();
uString="?JSONString=" + updateMap;
//Override_end
resp = getUrl("https://books.zoho.com/api/v3/invoices?authtoken=" + authtoken + "&organization_id=" + organisationId + dueDate + overdue);
resp2 = getUrl("https://books.zoho.com/api/v3/contacts?authtoken=" + authtoken + "&organization_id=" + organisationId + customFunction);
contactsWithLiquidation=resp2.getJSON("contacts");
for each contact in contactsWithLiquidation.toJSONList()
{
	liquidationList.add(contact.getJSON("contact_id"));
}
info liquidationList;
listOfResp=resp.getJSON("invoices");
emptyMap=map();
for each elem in listOfResp.toJSONList()
{
	customerId=elem.getJSON("customer_id");
	customerName=elem.getJSON("customer_name");
	if(customerName  ==  "Test Account")
	{
		if(!checkIdList.contains(customerId)  &&  !liquidationList.contains(customerId))
		{
			response = postUrl("https://books.zoho.com/api/v3/contacts/" + customerId + uString,mString,m,false);
			info response;
		}
		checkIdList.add(customerId);
		info "-------------------------------------";
	}
}
