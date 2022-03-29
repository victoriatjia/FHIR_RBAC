//Set table field
let field= {
	code: ["Username", "Password"],
	desc: [],
	isRequired: [1,1],		
	type: ["text", "password"],
	signUpPage: ""
};

if(web_language=="CH")
{
	field.desc= ["帳號 (Email)", "密碼"];
	field.signUpPage= "報名請點我";
	pageName= "登入網頁";
}
else if(web_language=="EN")
{
	field.desc= ["Email", "Password"];
	field.signUpPage= "Click here to sign up";
	pageName= "Login";
}

//Function Initialization
$(document).ready(function(){
	let temp="";
	/* Clear session */
	let stringValue = window.sessionStorage.getItem("loginAccount")
    if (stringValue != null) 
	{
		window.sessionStorage.removeItem("loginAccount");
	}
	
	/* Show Login Form field */
	for(let i=0; i<field.desc.length;i++){
		temp += '<tr><td>' + field.desc[i];
		if(field.isRequired[i])			
			temp += '<font color="red"> *</font>';
		
		temp += '</td><td>:&nbsp;<input type="' + field.type[i] + '" id="p' + field.code[i] + '" ';
		
		if(field.code[i] == "Password")
			temp += 'onkeyup="SHA256PWD.value = sha256(this.value);" ';
			
		if(field.isRequired[i])			
			temp += 'required';
			
		temp += '><br></td></tr>';
	}
	temp+= '<tr><td colspan="2" align="right"><input id="btnSubmit" type="button" value="Submit" onclick="validateDate()"></td></tr>';
	document.getElementById('mainTable').innerHTML= temp;
	
	/* Get Organization Information */
	getResource(FHIRURL, 'Organization', '/' + DB.organization, FHIRResponseType, 'getOrganization');
});

function getOrganization(str){
	let obj= JSON.parse(str);
	if(retValue(obj))
	{
		loginData.organization.id = (obj.id) ? obj.id : '';
		loginData.organization.identifier= (obj.identifier)? obj.identifier[0].value : '';
		loginData.organization.status= (obj.active == true) ? 'Active' : 'Inactive';
		loginData.organization.name= (obj.name) ? obj.name : '';
		if (obj.contact)
		{
			loginData.organization.cpname= obj.contact[0].name.text;
			obj.contact[0].telecom.map((telecom, i) => {
				if (telecom.system == "email")
					loginData.organization.cpemail= telecom.value;
				else if (telecom.system == "phone")
					loginData.organization.cpphone= telecom.value;
			});
		}
		//organization= new COrganization(id, identifier, status, name, cpname, cpphone, cpemail);
	}
	showWebsiteInfo();
}


//Show Page Title and Header (need to initialize info.pageName beforehand)
function showWebsiteInfo()
{
	document.title= loginData.organization.name + " - " + pageName;
	$("#header").html(loginData.organization.name + "<br>" + pageName);
	message.contactPerson= "please contact " + loginData.organization.cpname + "<br>Phone No.：" + loginData.organization.cpphone + "<br>Email：" + loginData.organization.cpemail;
	$("#cp").html(message.signInFail + message.contactPerson);
}

//Validate data input by user
function validateDate(){
	if(checkRequiredField(field)){
		let id= $("#pUsername").val();
		getResource(FHIRURL, 'Person', '?identifier=' + id, FHIRResponseType, 'verifyUser');
	}
}

//Verify login account username and password
function verifyUser(str)
{ 
	let obj= JSON.parse(str);
	let encPassword= document.getElementById('SHA256PWD').value;
	let retID="", retName="", retUsername="", retPassword="", memberID="";
	let arrmemberID= new Array();
	
	if (obj.total == 0) alert(message.accountUnexist);
	else if (obj.total == 1){
		loginData.person.id = (obj.entry[0].resource.id) ? obj.entry[0].resource.id : '';
		loginData.person.name = (obj.entry[0].resource.name) ? obj.entry[0].resource.name[0].text : '';
		loginData.person.username= (obj.entry[0].resource.identifier[0])? obj.entry[0].resource.identifier[0].value : '';
		retPassword= (obj.entry[0].resource.identifier[1])? obj.entry[0].resource.identifier[1].value : '';
		
		if(obj.entry[0].resource.link)
		{
			obj.entry[0].resource.link.map((link, i) => {
				let roleID= link.target.reference;
				if(roleID.split('/')[0] == "Practitioner") 
				{
					CRole.practID= roleID.split('/')[1];
					getResource(FHIRURL, 'PractitionerRole', '?practitioner=' + CRole.practID, FHIRResponseType, 'getPractitionerRole');
					if(CRole.organization == DB.organization)
						loginData.role.push(CRole);
				}
			});
		}
		
		if(encPassword!=retPassword)	alert(message.passwordWrong);
		else if(loginData.role.length == 0)	alert(message.authorizeFail);
		else {
			sessionSet("loginAccount", loginData, 30);
			window.open('index.html',"_self");
		}
	}
	else{
		alert(message.systemError + " " + message.contactPerson);
	}
}


function getPractitionerRole(str)
{ 
	let obj= JSON.parse(str);
	obj.entry.map((entry, i) => {
		CRole.practRoleID = entry.resource.id;
		CRole.organization = entry.resource.organization.reference.split('/')[1];
		entry.resource.code[0].coding.map((coding, i) => {
			CRole.roleCode.push(coding.code);
		});
	});
}