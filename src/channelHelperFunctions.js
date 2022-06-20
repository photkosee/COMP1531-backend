import { getData, setData } from './dataStore.js';

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

	for (const channel of data.channels) {
		if (channelId === channel.channel_id) {
			return true;
		}
	}

	return false;
}

function checkIfMember(authUserId, channelId) {
    /*
		Function checkIfMember: checks if given user is a member of the 
            given channel
		
		Arguments:
        	authUserId	integer type   -- Input integer supplied by user
			channelId	integer type   -- Input integer supplied by user
			
		Return Value:
            object: returns details of channel if the user is a member,
                    returns empty object if user is not a member
			
	*/
    const data = getData();
    let chosenChannel = {};

    for (const channel of data.channels) {
        if (channelId === channel.channel_id) {
            chosenChannel = channel;
        }
    }

    if (chosenChannel.allMembers.includes(authUserId)) {
        return chosenChannel;
    }
    
    return {};

}

export { checkAuthUserId, checkChannelId, checkIfMember };
