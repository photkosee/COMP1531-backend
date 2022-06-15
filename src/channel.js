function channelMessagesV1(authUserId, channelId, start) {
	/*
		Function channelMessagesV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			channelId   integer type   -- Input integer supplied by user
			start 		integer type   -- Input integer supplied by user			
			
		Return Value:
			string: a combined of authUserId, channelId and start
			
	*/
    return 'authUserId' + 'channelId' + 'start';
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
    return {
		object: 'object',
	};
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
    return {
		object: 'object',
	};
};

export { channelMessagesV1, channelInviteV1, channelJoinV1, channelDetailsV1 };

