import { getData, setData } from './dataStore.js';

function userProfileV1(authUserId, uId) {
  /*
		Function userProfileV1, returns information about uId's userId, email, first name, 
    last name, and handle
    
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
      uId	        integer type   -- Input integer supplied by user
			
		Return Value:
			Object containing uId, email, nameFirst, nameLast, handleStr 
	*/
  const data = getData();
	let check_authId = 0;

	for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === authUserId) {
			check_authId = 1;
		}
	}

	if (check_authId === 0) {
		return { error: 'error' };
	}

	check_authId = 0;

	for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === uId) {
			check_authId = 1;
		}
	}

	if (check_authId === 0) {
		return { error: 'error' };
	}

  for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === uId) {
			return {
        user: {
          uId: data.users[i].authUserId, 
          email: data.users[i].email,
          nameFirst: data.users[i].nameFirst, 
          nameLast: data.users[i].nameLast, 
          handleStr: data.users[i].handleStr
        }
      };
		}
	}

  { error: 'error' };
}

export { userProfileV1 }