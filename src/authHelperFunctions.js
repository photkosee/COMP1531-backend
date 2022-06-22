import validator from 'validator';

function paramTypeChecker(email, password, nameFirst, nameLast) {
	/*
		Description:
			Helper function to check typeof parameters entered in authRegisterV1

		Arguments:
			email	  string type	-- Input string supplied by function authRegisterV1
			passwrd   string type   -- Input string supplied by function authRegisterV1
			nameFirst string type   -- Input string supplied by function authRegisterV1
			nameLast  string type   -- Input string supplied by function authRegisterV1
			
		Return Value:
			boolean: true | false
	*/

	if (typeof email === 'string' &&
		typeof password === 'string' &&
		typeof nameFirst === 'string' &&
		typeof nameLast === 'string') {
	
		return true;
		
	} else {
		return false;
	};
}


function genHandleStr(nameFirst, nameLast, userData) {
	/*
		Description:
			Helper function for generating user handleStr

		Arguments:
			nameFirst string type   -- Input string supplied by function authRegisterV1
			nameLast  string type   -- Input string supplied by function authRegisterV1
			userData array type   -- Users array supplied by function authRegisterV1
			
		Return Value:
			string: newUserHandle
	*/

	let newUserHandle = `${nameFirst + nameLast}`;

	newUserHandle = newUserHandle.replaceAll(' ', '');

	newUserHandle = newUserHandle.toLowerCase();

	newUserHandle = newUserHandle.replace(/[^a-z0-9]/gi, '');

	newUserHandle = newUserHandle.substring(0, 20);

	const lenHandleStr = newUserHandle.length;

	let numToAppend = 0;

	for (let i = 0; i < userData.length; i++) {

		if (userData[i].handleStr === newUserHandle) {

			newUserHandle = `${newUserHandle.substring(0, lenHandleStr) + numToAppend.toString()}`;

			i = 0;
			numToAppend++;
		};
	};

	return newUserHandle;
}


function emailValidator(email) {
	/*
		Description:
			Helper function to validate user Email

		Arguments:
			email string type   -- Input string supplied by function authRegisterV1
			
		Return Value:
			boolean: true | false
	*/

	const specialCharacters = ['!','#', '$', '%', '&', '*', '+', '-', '/', '=', '?', '^', '`', '{', '|', '}', '~'];

	if (validator.isEmail(email)) {

		for (const character of specialCharacters) {

			if (email.includes(character)) {
				return false;
			};
		};

	} else {
		return false;
	}
}


export {
	paramTypeChecker,
	genHandleStr,
	emailValidator
};
