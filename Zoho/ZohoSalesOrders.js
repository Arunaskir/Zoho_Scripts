salesOrders = zoho.crm.getRecords("SalesOrders");
for each so in salesOrders
{
	soDate=(so.get("Created Time")).toDate().getYear();
	soAccId=(so.get("ACCOUNTID")).toLong();
	soGrandTotal=(so.get("Grand Total")).toDecimal();
	account = zoho.crm.getRecordById(("Accounts"),soAccId);
	sales=(account).get(soDate + " sales");
	if(isNull(sales))
	{
		accSales=0.0;
	}
	else
	{
		accSales=sales.toDecimal();
	}
	addSales=(accSales  +  soGrandTotal);
	resp = zoho.crm.updateRecord(("Accounts"),soAccId.toString(),{ soDate + " sales" : addSales });
	info resp;
}
