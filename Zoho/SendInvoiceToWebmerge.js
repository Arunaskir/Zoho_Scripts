webmergeAPI="?auth=:AuthToken:Secret";
invoiceId_=input.invoiceId.toLong();
api=webmergeAPI.toMap();
updateMap=map();
productsMap=map();
productMap=map();
invoice = zoho.crm.getRecordById("Invoices",invoiceId_);
info invoice;
contactId=(invoice.get("CONTACTID")).toLong();
contact = zoho.crm.getRecordById("Contacts",contactId);
products=invoice.get("product");
for each product in products.toList()
{
	info product;
}
info productsMap;
cont=contact.toString();
inv=invoice.toString();
info "product\":[";
info "product\":[{\"product\":";
inv=inv.replaceAll("Product Name","name");
inv=inv.replaceAll("List Price","list_price");
inv=inv.replaceAll("Quantity","quantity");
inv=inv.replaceAll("Net Total","netTotal");
inv=inv.replaceAll(("Total After Discount"),"prod_price");
double=((cont.removeLastOccurence("}")) + ", ") + inv.removeFirstOccurence("{");
//info double;
invoice=double.toMap();
header="Content-Type: application/json";
head=header.toMap();
webmergeSecret="9KLFYQKU";
docId="138847/";
postas="https://www.webmerge.me/merge/137207/xqk6ax?test=1";
info updateMap;
resp = postUrl(postas,invoice,head,false);
info resp;
