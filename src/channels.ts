import { getData, setData } from './dataStore.js';

const ERROR = {error: 'error'};

interface newChannelDetails {
	channelId: number,
    name: string,
    ownerMembers: any,
    allMembers: any,
    isPublic: boolean,
    messages: any,
};
  
function channelsListallV1(token: string) {
	/*
		Description:
			channelsListallV1  returning all existing 
			channels if the given authUserId is valid
		
		Arguments:
			token		string  type    -- Input string supplied by user
			
		Return Value:
			array of object: having details of channelId and name
			object: {error: 'error'}
	*/

	const data: any = getData();
	let check_token: boolean = false;

	for (const user of data.users) {

		if (token === user.token) {
			check_token = true;
		};
	};

	if (check_token === false) {
		return ERROR;
	}

	const channels: any = [];

	for (let i = 0; i < data.channels.length; i++) {

		channels.push({ 
			'channelId': data.channels[i].channelId, 
			'name': data.channels[i].name 
		});

	};

    return { channels: channels };
}


function channelsListV1(token: string) {
	/*
		Description:
			channelsListV1 returning all channels that the 
			given authUserId is part of the channels
		
		Arguments:
			token		string  type    -- Input string supplied by user
			
		Return Value:
			array of object: having details of channelId and name
			object: {error: 'error'}
	*/

	const data: any = getData();

	let authUserId: number = -1;

	for (const user of data.users) {

		if (token === user.token) {
			let authUserId: number = user.authUserId;
		};
	};

	if (authUserId === -1) {
		return ERROR;
	}

	const channels: any = [];

	for (let i = 0; i < data.channels.length; i++) {

		for (let j = 0; j < data.channels[i].allMembers.length; j++) {

			if (data.channels[i].allMembers[j].uId === authUserId) {

				channels.push({
					'channelId': data.channels[i].channelId,
					'name': data.channels[i].name
				});
			};
		};
	};

    return { channels: channels }; 
}


function channelsCreateV1(token: string, name: string, isPublic: boolean) {
	/*
		Description:
			channelsCreateV1  creating a new channel from given authUserId,
			name and set if the channel is private or public.

		Arguments:
			token		string  type    -- Input string supplied by user
			name		string  type	-- Input string supplied by user	
			isPublic	boolean type	-- Input boolean supplied by user
			
		Return Value:
			interger: channelId
			object: {error: 'error'}
			
	*/

	const data: any = getData();

	if (typeof isPublic !== 'boolean') {
		return ERROR;
	};

	if (name.length < 1 || name.length > 20) {
		return ERROR;
	};

	let authUserId: number = -1;

	for (const user of data.users) {

		if (token === user.token) {
			let authUserId: number = user.authUserId;
		};
	};

	if (authUserId === -1) {
		return ERROR;
	}

	for (let i = 0; i < data.users.length; i++) {

		if (data.users[i].authUserId === authUserId) {

			const channelId: number = (data.channels.length) + 1;

			const newChannelDetails: newChannelDetails = {
				channelId: channelId,
				name: name,
				ownerMembers: [{
					uId: authUserId,
					email: data.users[i].email,
					nameFirst: data.users[i].nameFirst,
					nameLast: data.users[i].nameLast,
					handleStr: data.users[i].handleStr 
				}],
				allMembers: [{ 
					uId: authUserId,
					email: data.users[i].email,
					nameFirst: data.users[i].nameFirst,
					nameLast: data.users[i].nameLast,
					handleStr: data.users[i].handleStr 
				}],
				isPublic: isPublic,
				messages: [],
			};

			data.channels.push(newChannelDetails);
			setData(data);

			return { channelId: channelId };
		};
	};

	return ERROR;
}


export{
	channelsCreateV1,
	channelsListV1,
	channelsListallV1
};