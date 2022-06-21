import { getData, setData } from './dataStore.js';
import { checkChannelId, checkAuthUserId, authInChannel, getMessages } from './channelHelperFunction.js';

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
 
	if (start + 50 < messages.length) {
		const end = start + 50;
	} else {
		const end = -1;
	}

	return {
		messages: messagesArray,
		start: start,
		end: end, 
	}
	

};


function channelInviteV1(authUserId, channelId, uId) {
	/*
		Function channelInviteV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			channelId   integer type   -- Input integer supplied by user
			uId 		integer type   -- Input integer supplied by user			
			
		Return Value:
			string: a combined of authUserId, channelId and uId
			
	*/
    return 'authUserId' + 'channelId' + 'uId';
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
			string: a combined of authUserId and channelId
			
	*/
    return 'authUserId' + 'channelId';
};
