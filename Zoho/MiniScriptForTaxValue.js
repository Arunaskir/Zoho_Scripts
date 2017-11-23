QBOCompanyID = "In quotes write QBO company ID";
searchResponse = intuit.quickbooks.searchRecords("zoho_quickbooks",QBOCompanyID,"select * from TaxCode");
	taxCodes = searchResponse.get("QueryResponse").toJSONList();
for each taxCode in taxCodes
{
	tax = taxCode.getJSON("TaxCode").toJSONList();
	for each taxPart in tax
    {
		if(taxPart.contains("Sync"))
		{
		info taxPart.getJSON("Description");
		info "Value required in script: " + taxPart.getJSON("Id");
		info "====================================================================";
		}
    }
}
