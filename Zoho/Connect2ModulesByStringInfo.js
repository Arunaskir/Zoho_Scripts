error=List();
// variable used for checking dublicates
Segments = zoho.crm.getRecords("CustomModule1",12, 12);
nRecords=0;
nRecordsToCheck=0;
nOK=0;
nDoubts=0;
nErr=0;
for each segment in Segments
{
	nRecords=(nRecords  +  1);
	nLocalErrorsDoubts=0;
	platNameWithCommas="";
	if(segment.get("Platforms")  !=  null)
	{
		records=segment.get("Platforms").toList(", ");
		//records of platforms, split by comma
		for each rec in records
		{
			if(rec.startsWith("efa"))
			{
				//efa Fachmesse für Gebäude- und Elektrotechnik, Licht, Klima und Automation
				//info "*** " + rec;
				rec="efa";
			}
			search = zoho.crm.searchRecords("CustomModule2","(CustomModule2 Name|=|" + rec + ")");
			if(search.size()  =  1)
			{
				plat=search.get(0);
				//myMap={ "Segment" : segment.get("CustomModule1 Name"), "Platform" : plat.get("CustomModule2 Name") };
				//response = zoho.crm.create("CustomModule3",myMap);
				//info response;
				//info ((("Segment: (" + segment.get("CustomModule1 Name")) + ") contains platform: (") + rec) + ") is added";
				nOK=(nOK  +  1);
				//clear platNameWithCommas since we found a new 'normal' platform name
				platNameWithCommas="";
			}
			//
			else if(platNameWithCommas.contains(rec))
			{
				//this is just a long plat name, do nothing
				nLocalErrorsDoubts=(nLocalErrorsDoubts  +  1);
			}
			else
			{
				nLocalErrorsDoubts=(nLocalErrorsDoubts  +  1);
				search = zoho.crm.searchRecords("CustomModule2","(CustomModule2 Name|starts with|" + rec + ")");
				isError=true;
				if(search.size()  =  1)
				{
					plat=search.get(0);
					if(plat.get("CustomModule2 Name").contains(","))
					{
						//info (((("Segment: (" + segment.get("CustomModule1 Name")) + "). found: (") + rec) + ")=") + plat.get("CustomModule2 Name");
						error.add("check if not duplicate: ");
						error.add(rec);
						//myMap={ "Segment" : segment.get("CustomModule1 Name"), "Platform" : plat.get("CustomModule2 Name") };
						//response = zoho.crm.create("CustomModule3",myMap);
						//	info response;
						//info ((("Segment: (" + segment.get("CustomModule1 Name")) + ") contains platform: (") + rec) + ") is added";
						nDoubts=(nDoubts  +  1);
						platNameWithCommas=plat.get("CustomModule2 Name");
						isError=false;
					}
				}
				if(isError)
				{
					//info ((("Segment: (" + segment.get("CustomModule1 Name")) + "). error: (") + rec) + ")";
					error.add("check if platform by given name does not exist: ");
					error.add(rec);
					nErr=(nErr  +  1);
					nLocalErrorsDoubts=(nLocalErrorsDoubts  +  1);
				}
			}
		}

		if(error.size()  !=  0)
		{
			resp = zoho.crm.updateRecord("CustomModule1",(segment.get("CUSTOMMODULE1_ID")).toString(),{ "Log" : error });
			error.clear();
		}

		// after we checked all platforms from one segment, we can delete duplicate variable
	}

	if(nLocalErrorsDoubts  >  0)
	{
		nRecordsToCheck=(nRecordsToCheck  +  1);
		myMap={ "FlagToCheck" : true, "Log" : "log" };
		//update
	}

}

info "nRecords=" + nRecords;
info "nRecordsToCheck=" + nRecordsToCheck;
info "nOK=" + nOK;
info "nDoubts=" + nDoubts;
info "nErr=" + nErr;
