function channelsListallV1(authUserId) {
	/*
		Function channelsListAllV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			
		Return Value:
			string: of authUserId
			
	*/
    return 'authUserId';
};


function channelsListV1(authUserId) {
	/*
		Function channelsListV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			
		Return Value:
			string: of authUserId
			
	*/
    return 'authUserId'; 
};


function channelsCreateV1(authUserId, name, isPublic) {
	/*
		Function channelsCreateV1 (waiting for details in future tasks)
		
		Arguments:
			authUserId	integer type    -- Input integer supplied by user
			name		string  type	-- Input string supplied by user	
			isPublic	boolean type	-- Input boolean supplied by user
			
		Return Value:
			string: a combined of authUserId, name and isPublic
			
	*/
    return 'authUserId' + 'name' + 'isPublic';
};

export { channelsListallV1, channelsListV1, channelsCreateV1 };
