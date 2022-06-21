import { getData, setData } from './dataStore.js'; 
    

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



export function checkChannelInvite(channelId, authUserId, uId) {
	/*
		Function checkChannelInvite: 
			checks whether authUserId and uId are in a valid channel
		
		Arguments:
			authUserId	integer type   -- Input integer supplied by user
			
		Return Value:
			boolean: 'true' if authUserId in channel and uId not in valid channel
			boolean: 'false' authUser not in channel or uId in channel or channel invalid
			
	*/
    const dataStore = getData(); 
    if (!Number.isInteger(channelId)) {
        return false; 
    }
    let channelExists = false; 
	let uIdInChannel = false; 
	let authInChannel = false; 
	for (const channels of dataStore.channels) {
		if (channels.channelId === channelId) {
			channelExists = true; 
			if (channels.allMembers.includes(uId)) {
				uIdInChannel = true;
			}
			if (channels.allMembers.includes(authUserId)) {
				authInChannel = true; 
			}
		}
		
	}

    if (channelExists && !uIdInChannel && authInChannel) {
        return true;
    } else {
        return false; 
    }

}

    


