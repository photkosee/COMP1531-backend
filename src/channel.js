import { getData } from './dataStore.js';

import { checkAuthUserId, checkChannelId, checkIfMember, authInChannel, getMessages } from './channelHelperFunctions.js';

const ERROR = {
    error: 'error'
}


function channelMessagesV1(authUserId, channelId, start) {
	/*
		Function channelMessagesV1: checks the message history of a given channel
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			channelId   integer type   -- Input integer supplied by user
			start 		integer type   -- Input integer supplied by user			
			
		Return Value:

			object: { 
				messages: [messages],
				start: start,
				end: end,
			}
			
	*/

	if (!checkChannelId(channelId) || !checkAuthUserId(authUserId) 
			|| !authInChannel(channelId, authUserId) || start > getMessages(channelId).length) {
		return ERROR; 
	}

	
	const messagesArray = [];
	const messages = getMessages(channelId);
		
	for (let i = 0; i < 50 && (start + i < messages.length); i++) {
		messagesArray.push(messages[start + i]);
	}
	
	let end = -1;
	if (start + 50 < messages.length) {
		end = start + 50;
	} 

	return {
		messages: messagesArray,
		start: start,
		end: end, 
	}
	

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
			object: returns empty object on success
			
	*/

	if (!(checkAuthUserId(authUserId)) || !(checkChannelId(channelId))) {
		return ERROR;
	}

	let channelDetails = checkIfMember(authUserId, channelId);
	if (Object.keys(channelDetails).length !== 0) {
		return ERROR;
	}

	const data = getData();

	let chosenChannel = {};
	for (const channel of data.channels) {
		if (channelId === channel.channelId) { //////////// CHANGE TO channelId
			chosenChannel = channel;
		}
	}

	let chosenUser = {};
	for (const user of data.users) {
		if (authUserId === user.authUserId) {
			chosenUser = user;
		}
	}

	if (chosenChannel.isPublic === false) { // Private channel
		if (chosenUser.permissionId !== 1) { /////////////// CHANGE TO permissionId
			return ERROR;
		}
	}

	chosenChannel.allMembers.push(authUserId);

    return {};
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
		return ERROR;
	}

	let channelDetails = checkIfMember(authUserId, channelId);
	if (Object.keys(channelDetails).length === 0) {
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
