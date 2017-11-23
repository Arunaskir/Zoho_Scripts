searchTax = input.QBOTaxName;
taxId_ = input.taxId;
quickBooksId = "QBO ID";
searchResponse = intuit.quickbooks.searchRecords("zoho_quickbooks",quickBooksId,"select Description from TaxCode");
response = searchResponse.get("QueryResponse");
taxes = response.getJSON("TaxCode");
for each tax in taxes.toJSONList()
{
	if (tax.getJSON("Description")==searchTax)
	{
		id = tax.getJSON("Id").toLong();
		resp = zoho.crm.updateRecord("Taxes", taxId_.toString(), {"taxValue": id});
		info resp;
	}
}
