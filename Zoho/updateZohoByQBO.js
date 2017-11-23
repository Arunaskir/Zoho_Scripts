zohoIDtoQBO = List();
invoiceName = "Invoice ";
updateMap = {"Status": "Paid"};
payedStatus = "Payment";
searchZoho = zoho.crm.searchRecords("Invoices","(Status|=|Pending Payment)");
for each search in searchZoho
{
	invoice=search.get("Subject");
	number=(invoice.removeFirstOccurence("Invoice ")).toLong();
	zohoIDtoQBO.add("'" + number + "'");
	info "---------------------";
}
searchResponse = intuit.quickbooks.searchRecords("zoho_quickbooks",QBOId,"select LinkedTxn, DocNumber from Invoice where DocNumber in (" + zohoIDtoQBO + ")");

invoice = searchResponse.get("QueryResponse");
invoice = invoice.getJSON("Invoice");
inva = invoice.toJSONList();

for each inv in inva
{
	invoiceName = "Invoice ";
	docNr = inv.getJSON("DocNumber");
	linkedTXN = inv.getJSON("LinkedTxn").toString();
	info linkedTXN;
	if (contains (linkedTXN,payedStatus))
	{
		invoiceName = invoiceName + docNr;
		info invoiceName;
		record = zoho.crm.searchRecords("Invoices", "(Subject|=|" + invoiceName + ")");
		for each rec in record
		{
			id = rec.get("INVOICEID");
		}

		resp = zoho.crm.updateRecord("Invoices", id, updateMap);
		info resp;
	}
}
