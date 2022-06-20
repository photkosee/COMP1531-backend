import { getData, setData } from './dataStore.js';

function userProfileV1(authUserId, uId) {
  /*
		Function userProfileV1, returns information about uId's userId, email, first name, 
    last name, and handle
    
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
      		uId	        integer type   -- Input integer supplied by user
			
		Return Value:
			Object:		{ uId, email, nameFirst, nameLast, handleStr }
	*/
  const data = getData();
	let checkAuthId = 0;

	for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === authUserId) {
			checkAuthId = 1;
		}
	}

	if (checkAuthId === 0) {
		return { error: 'error' };
	}

	checkAuthId = 0;

	for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === uId) {
			checkAuthId = 1;
		}
	}

	if (checkAuthId === 0) {
		return { error: 'error' };
	}

  for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === uId) {
			return {
				uId: data.users[i].authUserId, 
				email: data.users[i].email,
				nameFirst: data.users[i].nameFirst, 
				nameLast: data.users[i].nameLast, 
				handleStr: data.users[i].handleStr
        	}
      	};
	}

  return { error: 'error' };
}

export { userProfileV1 }