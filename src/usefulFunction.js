import { getData } from './dataStore.js';

function checkAuthUserId(authUserId) {
	/*
		Function checkAuthUserId: checks validity and existence of argument
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			
		Return Value:
			boolean: 'true' if valid, 'false' if invalid or non-existent
			
	*/
	const data = getData();

	if (typeof authUserId !== 'number') {
		return false;
	}

	for (const user of data.users) {
		if (authUserId === user.authUserId) {
			return true;
		}
	}

	return false;
}

function checkChannelId(channelId) {
	/*
		Function checkChannelId: checks validity and existence of argument
		
		Arguments:
			channelId	integer type   -- Input integer supplied by user
			
		Return Value:
			boolean: 'true' if valid, 'false' if invalid or non-existent
			
	*/
	const data = getData();

	if (typeof channelId !== 'number') {
		return false;
	}

	for (const channel of channels.users) {
		if (channelId === channel.channel_id) {
			return true;
		}
	}

	return false;
}

export { checkAuthUserId, checkChannelId };