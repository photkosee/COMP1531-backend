import { getData, setData } from './dataStore.js'; 
    
export function checkUserAuthIdExists(authUserId, uId) {
    const dataStore = getData(); 
    if (!Number.isInteger(authUserId) || !Number.isInteger(uId)) {
        return false; 
    }

    let authExists = false; 
	let uIdExists = false;
	for (const users of dataStore.users) {
		if (users.authUserId === authUserId) {
			authExists = true; 
		} else if (users.authUserId === uId) {
			uIdExists = true; 
		}
	}

    if (authExists && uIdExists) {
        return true;
    } else {
        return false;
    }

}    


export function checkChannelInvite(channelId, authUserId, uId) {
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

    if (channelExists && uIdInChannel && authInChannel) {
        return true;
    } else {
        return false; 
    }

}

    


