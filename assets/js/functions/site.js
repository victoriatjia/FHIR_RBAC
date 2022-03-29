/*
    Public variable area
*/
var partOfid = '';
var web_language= "EN";
var pageName='';

let message= {
	contactPerson: "",
	signUpFail: "",
	signUpOK: "",	
	signInFail: "",
	requiredField: "",
	emailFormatWrong: "",
	accountExist: "",
	accountUnexist: "",
	passwordWrong: "",
	authorizeFail: "",
	systemError: ""
}

if(web_language=="CH")
{
	// message.contactPerson= "請聯絡" + info.universityName + " " + info.universityDept +
				   // " " + info.cpName + "<br>電話：" + info.cpPhone + "<br>郵件：" + info.cpEmail;
	message.signUpFail= "註冊失敗!";
	message.signUpOK= "註冊成功, 需等1-2分鐘才可以登入唷！";
	message.signInFail= "無法登入或忘記密碼";
	message.requiredField= "表單未填寫完畢";
	message.emailFormatWrong= "Email 格式錯誤";
	message.accountExist= "該帳號已註冊過!";
	message.accountUnexist= "帳號不存在!";
	message.passwordWrong= "密碼錯誤!";
	message.authorizeFail= "只有教師有權限!";
	message.systemError= "系統錯誤!";
}
else if(web_language=="EN")
{
	message.contactPerson='';
	message.signUpFail= "Registration failed!";
	message.signUpOK= "Registration completed, please wait 1-2 minutes for sign in！";
	message.signInFail= "Sign in failed or forget password, ";
	message.requiredField= "Required field must not be empty";
	message.emailFormatWrong= "Wrong email format";
	message.accountExist="This email has been registered!";
	message.accountUnexist= "This user account is not registered!";
	message.updatePasswordOK= "Update password completed！";
	message.updatePasswordFail ="Update password fail!";
	message.passwordWrong= "Wrong password!";
	message.authorizeFail= "Account authorization fail! Make sure you login with practitioner account of this organization";
	message.systemError= "System error!";
}

let loginData = {
	expirationDate: '',
	person:{
		id: '',
		identifier: '',
		name: '',
		username: ''
	},
	role: [],
	organization: {
		id: '',
		identifier: '',
		status: '',	
		name: '',		
		cpname: '',
		cpphone: '',
		cpemail: ''
	},
	roleAccess:[]
}
	
let CRole = {
	practID: '',
	practRoleID: '',
	practRoleIdentifier: '',
	organization: '',
	roleCode: []
}

let CRoleAccess = {
}

// class CPerson{
	// constructor() {
		// this.id="";
		// this.name="";
		// this.username="";
		// this.role=[];
	// }
	
	// newAppointment(p){
		// this.role.push(p)
		// return p;
	// }
// }

// class CRole{
	// constructor(pid, poid) {
		// this.id= pid;
		// this.identifier= poid;
		// this.organization= poid;
	// }
// }

// class COrganization{
	// constructor(pid, poid, pstatus, pname, pcpname, pcpphone, pcpemail) {
		// this.id= pid;
		// this.identifier= poid;
		// this.status= pstatus;
		// this.name= pname;
		// this.cpname= pcpname;
		// this.cpphone= pcpphone;
		// this.cpemail= pcpemail;
	// }
// }

// let user = new CPerson();
let organization;
/*
    說明：點擊"Logo"後，返回主頁
*/
// document.getElementById('Logo').onclick = function () {
    // location.href = './Schedule/index2.html?id=100000100103'; //'./Schedule/index2.html';
// }

function getTodayDate() {
    var fullDate = new Date();
    var yyyy = fullDate.getFullYear();
    var MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : ("0" + (fullDate.getMonth() + 1));
    var dd = fullDate.getDate() < 10 ? ("0" + fullDate.getDate()) : fullDate.getDate();
    var today = yyyy + "-" + MM + "-" + dd;
    return today;
}

function getGender(str) {
    switch (str) {
        case 'male':
            return '男';
        case 'female':
            return '女';
        case 'unknown':
            return '未知';;
        default:
            return '其它';
    }
}

function tablePagination(id, row){
	let tableID= "#parent-" + id;
	$(tableID).after('<div id="nav" class="pagination"></div>');
	tableID+= " .child";
	var rowsShown = row;
	var rowsTotal = $(tableID).length;
	var numPages = rowsTotal/rowsShown;
	for(i = 0;i < numPages;i++) {
		var pageNum = i + 1;
		$('#nav').append('<a href="#" rel="'+i+'">'+pageNum+'</a> ');
	}
	$(tableID).hide();
	$(tableID).slice(0, rowsShown).show();
	$('#nav a:first').addClass('active');
	$('#nav a').bind('click', function(){

		$('#nav a').removeClass('active');
		$(this).addClass('active');
		var currPage = $(this).attr('rel');
		var startItem = currPage * rowsShown;
		var endItem = startItem + rowsShown;
		$(tableID).css('opacity','0.0').hide().slice(startItem, endItem).
				css('display','table-row').animate({opacity:1}, 300);
	});
}

function generateCSV(rows){
	let csvContent = "data:text/csv;charset=utf-8," 
		+ rows.map(e => e.join(",")).join("\n");
		
	var encodedUri = encodeURI(csvContent);
	window.open(encodedUri);	
}

/* Data Field Validation */
function checkRequiredField(fieldArr){
	var count = 0; //計數器
	var isEmpty=false, formatIsWrong= false;
	for (var k = 0; k < fieldArr.code.length; k++) {
		let obj= document.getElementById("p" + fieldArr.code[k]);
		if(fieldArr.isRequired[k])
		{
			if (fieldArr.type[k] == "radio" && !obj.checked) {
				isEmpty=true;
				break;
			}
			if ((fieldArr.type[k] == "text" || fieldArr.type[k] == "password") && obj.value == "") { 
				isEmpty=true;
				break;
			}
			if (fieldArr.type[k] == "email") { 
				var emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
				if (obj.value == ""){
					isEmpty=true;
					break;
				}
				else if (obj.value != "" && !emailFormat.test(obj.value)){
					formatIsWrong= true;
					break;
				}
			}
		}
	}
	if (isEmpty || formatIsWrong){
		if (isEmpty) alert(message.requiredField);
		if (formatIsWrong) alert(message.emailFormatWrong);
		document.getElementById("btnSubmit").disabled = false;
		return 0;
	}
	return 1;
}

function logOut(){			
	 window.sessionStorage.removeItem("loginAccount");
	 window.location.href = "../login.html";
}