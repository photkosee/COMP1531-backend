import { getData, setData } from './dataStore.js';

import { checkAuthUserId, checkChannelId, authInChannel, checkIfMember } from './channelHelperFunctions.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';

const ERROR = {
    error: 'error'
}




	const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; //in
	const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; //out
	const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId;
	console.log(channelInviteV1(authUserId1, channel1, authUserId2));

function channelMessagesV1(authUserId, channelId, start) {
	/*
		Function channelMessagesV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			channelId   integer type   -- Input integer supplied by user
			start 		integer type   -- Input integer supplied by user			
			
		Return Value:
			object: { name, isPublic, ownerMembers, allMembers }
			
	*/
    return 'authUserId' + 'channelId' + 'start';
};


function channelInviteV1(authUserId, channelId, uId) {
	/*
	
		Function channelInviteV1: Will invite and add a user into a channel

		Arguments:
		authUserId	integer type   -- Input integer supplied by user
		channelId   integer type   -- Input integer supplied by user
		uId 		integer type   -- Input integer supplied by user			
		

		Return Value:
			object: {} when user is added

    	
	*/

	if (checkAuthUserId(authUserId) && checkAuthUserId(uId) && checkChannelId(channelId) 
			&& authInChannel(channelId, authUserId) && !authInChannel(channelId, uId)) {
		const dataStore = getData(); 
		
		for (const channel of dataStore.channels) {
			if (channel.channelId === channelId) {
				channel.allMembers.push(uId); 
				setData(dataStore); 
				return {}; 
			}
		}

	} else {
		return ERROR; 
	}
	
};
  

function channelJoinV1(authUserId, channelId) {
	/*
		Function channelJoinV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			channelId   integer type   -- Input integer supplied by user
			
		Return Value:
			string: a combined of authUserId and channelId
			
	*/
    return 'authUserId' + 'channelId';
};


function channelDetailsV1(authUserId, channelId) {
	/*
		Function channelDetailsV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			channelId   integer type   -- Input integer supplied by user
			
		Return Value:
			object: { name, isPublic, ownerMembers, allMembers }
			
	*/

	if (!(checkAuthUserId(authUserId)) || !(checkChannelId(channelId))) {
		console.log("check authId");
		return ERROR;
	}

	let channelDetails = checkIfMember(authUserId, channelId);
	if (Object.keys(channelDetails).length === 0) {
		console.log("check if member");
		return ERROR;
	}

    return {
		name: channelDetails.name,
		isPublic: channelDetails.isPublic,
		ownerMembers: channelDetails.ownerMembers,
		allMembers: channelDetails.allMembers
	}
};

export { channelMessagesV1, channelInviteV1, channelJoinV1, channelDetailsV1 };


