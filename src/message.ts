import { getData, setData } from './dataStore';

const ERROR = { error: 'error' };
let messageGrobal: number = 1;

interface newMessagesDetails {
	messageId: number,
	uId: number,
	message: string,
	timeSent: number,
}

export function messageSendV1(token: string, channelId: number, message: string) {
/*
Description:
messageSendV1 send a message from the authorised 
user to the channel specified by channelId

Arguments:
token string type -- Input string supplied by user
channelId number type -- Input number supplied by user
message string type -- Input string supplied by user

Return Value:
interger: messageId
object: {error: 'error'}
*/
	const data: any = getData();

	if (message.length < 1 || message.length > 1000) {
		return ERROR;
	}

	let checkToken = false;
	let uId: number = 0;
	for (const user of data.users) {
		if (token === user.token) {
			uId = user.authUserId;
			checkToken = true;
		}
	}

	if (checkToken === false) {
		return ERROR;
	}

	for (const channel of data.channels) {
		for (const member of channel.allMembers) {
			if (member.uId === uId) {
				const messageId: number = messageGrobal;
				messageGrobal += 1;

				const newMessagesDetails: newMessagesDetails = {
					messageId: messageId,
					uId: uId,
					message: message,
					timeSent: Math.floor((new Date()).getTime() / 1000),
				};

				channel.messages.push(newMessagesDetails);
				setData(data);

				return { messageId: messageId };
			}
		}
  }

  return ERROR;
}
