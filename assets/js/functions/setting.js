//Set FHIR Server URL and response type (json or xml)
var FHIRURL = 'https://hapi.fhir.org/baseR4/';		//default FHIR Server API
var FHIRResponseType= 'json';							//Requested data type returned by the server
	
//Define required FHIR resources
let DB={
	organization: "2863475",	
	library: "2862114", 			//System module and menu mapping
	group: "2862615",					//User RBAC
};