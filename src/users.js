import { getData } from './dataStore.js';
import { checkAuthUserId } from './channelHelperFunctions.js';

const ERROR = {error: 'error'};

function userProfileV1(authUserId, uId) {
	/*
		Description:
			userProfileV1 returns information about uId's userId,
			email, first name, last name, and handle
    
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
      		uId	        integer type   -- Input integer supplied by user
			
		Return Value:
			Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
			object: {error: 'error'}
	*/

  	const data = getData();

	if (!(checkAuthUserId(authUserId))) {
		return ERROR;
	};

	if (!(checkAuthUserId(uId))) {
		return ERROR;
	};

	for (const user of data.users) {

		if (user.authUserId === uId) {

			return {
				user: {
					uId: user.authUserId, 
					email: user.email,
					nameFirst: user.nameFirst, 
					nameLast: user.nameLast, 
					handleStr: user.handleStr
				}
			};
		};
	};

  	return ERROR;
}


export { userProfileV1 };
