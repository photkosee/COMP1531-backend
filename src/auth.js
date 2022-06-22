import { getData, setData } from './dataStore.js';
import { paramTypeChecker, genHandleStr, emailValidator } from './authHelperFunctions.js';

const ERROR = {error: 'error'};

function authRegisterV1(email, password, nameFirst, nameLast) {
	/*
		Description:
			authRegisterV1 function will register new users with 
			their details in dataStore.js

		Arguments:
			email	  string type	-- Input string supplied by user
			passwrd   string type   -- Input string supplied by user
			nameFirst string type   -- Input string supplied by user
			nameLast  string type   -- Input string supplied by user
			
		Return Value:
			object: {authUserId: authUserId} will return users authId
			object: return {error: 'error'}
	*/

	const data = getData();

	const checkParamType = paramTypeChecker(email, password, nameFirst, nameLast);

	if (checkParamType) {

		email = email.trim();
		password = password.trim();
		nameFirst = nameFirst.trim();
		nameLast = nameLast.trim();

		const newAuthId = (data.users.length) + 1;

		const permissionId = (newAuthId === 1) ? 1 : 2;

		if (!(nameFirst.length >= 1 && nameFirst.length <= 50)) {
			return ERROR;
		};
		
		if (!(nameLast.length >= 1 && nameLast.length <= 50)) {
			return ERROR;
		};

		if (emailValidator(email) === false) {
			return ERROR;
		};

		for (const user of data.users) {

			if (user.email === email) {
				return ERROR;
			};
		};
		
		if (password.length < 6) {
			return ERROR;
		};

		const newHandleStr = genHandleStr(nameFirst, nameLast, data.users);

		const newUserDetails = {
			'authUserId': newAuthId,
			'nameFirst': nameFirst,
			'nameLast': nameLast,
			'email': email,
			'password': password,
			'handleStr': newHandleStr,
			'permissionId': permissionId,
			'isActive': true,
		};

		data.users.push(newUserDetails);

		setData(data);

		return {authUserId: newAuthId};

	} else {
		return ERROR;
	};
}


function authLoginV1(email, password) {
	/*
		Description:
			authLoginV1 function will help user to login if the user 
			enters correct email and password combination
		
		Arguments:
			email	  string type	-- Input string supplied by user
			passwrd   string type   -- Input string supplied by user
			
		Return Value:
			object: {authUserId: authUserId} will return users authId
			object: return {error: 'error'}	
	*/

	
	email = email.trim();

	const data = getData();

	for (const user of data.users) {

		if (user.email === email &&
			user.password === password &&
			user.isActive === true) {
			
			return {authUserId: user.authUserId};
		};
	};

	return ERROR;
}

export { 
	authRegisterV1,
	authLoginV1
};
