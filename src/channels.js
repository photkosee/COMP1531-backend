import { getData, setData } from './dataStore.js';

function channelsListallV1(authUserId) {
	/*
		Function channelsListAllV1, returning all existing channels if the given authUserId is valid.
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			
		Return Value:
			array of object: having details of channelId and name 
			
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

	const channels = [];

	for (let i = 0; i < data.channels.length; i++) {
		channels.push({ 
			'channelId': data.channels[i].channelId, 
			'name': data.channels[i].name 
		});
	}

    	return { channels: channels };
};


function channelsListV1(authUserId) {
	/*
		Function channelsListV1, returning all channels that the given authUserId is part of the channels.
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			
		Return Value:
			array of object: having details of channelId and name
			
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

	const channels = [];

	for (let i = 0; i < data.channels.length; i++) {
		for (let j = 0; j < data.channels[i].allMembers.length; j++) {
			if (data.channels[i].allMembers[j].uId === authUserId) {
				channels.push({
					'channelId': data.channels[i].channelId,
					'name': data.channels[i].name
				});
			}
		}
	}

    	return { channels: channels }; 
};


function channelsCreateV1(authUserId, name, isPublic) {
	/*
		Function channelsCreateV1, creating a new channel from given authUserId, name and 
		set if the channel is private or public
		
		Arguments:
			authUserId	integer type    -- Input integer supplied by user
			name		string  type	-- Input string supplied by user	
			isPublic	boolean type	-- Input boolean supplied by user
			
		Return Value:
			interger: channelId
			
	*/
	const data = getData();

	if (typeof isPublic !== 'boolean') {
		return { error: 'error' };
	}

	if (name.length < 1 || name.length > 20) {
		return { error: 'error' };
	}

	for (let i = 0; i < data.users.length; i++) {
		if (data.users[i].authUserId === authUserId) {
			const channelId = (data.channels.length) + 1;
			const newChannelDetails = {
				'channelId': channelId,
				'name': name,
				'ownerMembers': [ { uId: authUserId,
					email: data.users[i].email,
					nameFirst: data.users[i].nameFirst,
					nameLast: data.users[i].nameLast,
					handleStr: data.users[i].handleStr } ],
				'allMembers': [ { uId: authUserId,
					email: data.users[i].email,
					nameFirst: data.users[i].nameFirst,
					nameLast: data.users[i].nameLast,
					handleStr: data.users[i].handleStr } ],
				'isPublic': isPublic,
				'messages': []
			}
			data.channels.push(newChannelDetails);
			setData(data);
			return {channelId: channelId};
		}
	}

	return { error: 'error' };
};

export{ channelsCreateV1, channelsListV1, channelsListallV1 };