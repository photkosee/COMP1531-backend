import { getData, setData } from './dataStore.js'; 


export function checkChannelId(channelId) { //written by Jacinta
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

	for (const channel of data.channels) {
		if (channelId === channel.channelId) {
			return true;
		}
	}

	return false;
}

export function checkAuthUserId(authUserId) { //written by Jacinta
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



export function authInChannel(channelId, userId) {
    /*
		Function authInChannel: checks existence of user in channel
		
		Arguments:
			channelId	integer type   -- Input integer supplied by user
            userId  	integer type   -- Input integer supplied by user

		Return Value:
			boolean: 'true' if user in channel, 'false' if not in channel
			
	*/
    const dataStore = getData();
    for (const channel of dataStore.channels) {
        if (channel.channelId === channelId) {
            if (channel.allMembers.includes(userId)) {
                return true; 
            }
        }
    }
    return false; 
}


export function getMessages(channelId) {
	/*
		Function getMessages: returns array of messages of a given channel
		
		Arguments:
			channelId	integer type   -- Input integer supplied by user

		Return Value:
			array: messages of a given channelId			
	*/
    const dataStore = getData();
    for (const channel of dataStore.channels) {
        if (channel.channelId === channelId) {
            return channel.messages; 
        }
    } 
	

}


