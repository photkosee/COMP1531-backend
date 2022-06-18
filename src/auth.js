import { getData, setData } from './dataStore.js';
import validator from 'validator';

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
			object: return {error: 'error'

	*/

	const data = getData();

	const checkParamType = paramTypeChecker(email, password, nameFirst, nameLast);

	if (checkParamType) {
		// trim() Removes whitespace from both sides of a string
		email = email.trim();
		password = password.trim();
		nameFirst = nameFirst.trim();
		nameLast = nameLast.trim();

		const auth_user_id = (data.users.length) + 1;

		const permissionId = (auth_user_id === 1) ? 1 : 2;

		if (!(nameFirst.length >= 1 && nameFirst.length <= 50)) {
			return {error: 'error'};
		};
		
		if (!(nameLast.length >= 1 && nameLast.length <= 50)) {
			return {error: 'error'};
		};

		if (emailValidator(email) === false) {
			return {error: 'error'};
		};

		for (let i = 0; i < data.users.length; i++) {
			if (data.users[i].email === email) {
				return {error: 'error'};
			};
		};
		
		if (password.length < 6) {
			return {error: 'error'};
		};

		const new_handle_str = genHandleStr(nameFirst, nameLast, data.users);

		const newUserDetails = {
			'authUserId': auth_user_id,
			'nameFirst': nameFirst,
			'nameLast': nameLast,
			'email': email,
			'password': password,
			'handleStr': new_handle_str,
			'permission_id': permissionId,
		};

		data.users.push(newUserDetails);

		setData(data);

		return {authUserId: auth_user_id};

	} else {
		return {error: 'error'};
	};
};


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

	const data = getData();

	for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].email === email &&
			data.users[i].password === password) {
			
			return {authUserId: data.users[i].authUserId};
		};
	};

	return {error: 'error'};
};


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

	if (typeof email === 'string'&&
		typeof password === 'string' &&
		typeof nameFirst === 'string' &&
		typeof nameLast === 'string') {
	
		return true;
	} else {
		return false;
	};
};


function genHandleStr(nameFirst, nameLast, users_data) {
	/*

		Description:
			Helper function for generating user handleStr

		Arguments:
			nameFirst string type   -- Input string supplied by function authRegisterV1
			nameLast  string type   -- Input string supplied by function authRegisterV1
			users_data array type   -- Users array supplied by function authRegisterV1
			
		Return Value:
			string: newUserHandle

	*/

	let newUserHandle = `${nameFirst + nameLast}`;

	newUserHandle = newUserHandle.replaceAll(' ', '');

	newUserHandle = newUserHandle.toLowerCase();

	newUserHandle = newUserHandle.replace(/[^a-z0-9]/gi, '');

	newUserHandle = newUserHandle.substring(0, 20);

	let numToAppend = 0;

	for (let i = 0; i < users_data.length; i++) {
		if (users_data[i].handleStr === newUserHandle) {
			newUserHandle = `${newUserHandle.substring(0, 20) + numToAppend.toString()}`;
			i = 0;
			numToAppend++;
		};
	};

	return newUserHandle;
};


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

		for (let i = 0; i < specialCharacters.length; i++) {
			if (email.includes(specialCharacters[i])) {
				return false;
			};
		};

	} else {
		return false;
	}
}


export { authRegisterV1, authLoginV1 };
