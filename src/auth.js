import { getData, setData } from './dataStore.js';
import { paramTypeChecker, genHandleStr, emailValidator } from './authHelperFunctions.js';

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

export { authRegisterV1, authLoginV1 };
