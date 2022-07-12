import { getData, setData, getMessageId, setMessageId } from './dataStore';

const ERROR = { error: 'error' };

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
  let uId = 0;
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
      if (channelId === channel.channelId && member.uId === uId) {
        const messageId: number = getMessageId();
        setMessageId(messageId + 1);

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

export function messageEditV1(token: string, messageId: number, message: string) {
/*
Description:
messageEditV1 given a message, update its text with new text.
If the new message is an empty string, the message is deleted

Arguments:
token string type -- Input string supplied by user
messageId number type -- Input number supplied by user
message string type -- Input string supplied by user

Return Value:
object: {}
object: {error: 'error'}
*/
  const data: any = getData();

  if (message.length > 1000) {
    return ERROR;
  }

  let checkToken = false;
  let uId = 0;
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
    let i = 0;
    for (const channelMessage of channel.messages) {
      if (channelMessage.uId === uId &&
          channelMessage.messageId === messageId) {
        if (message !== '') {
          channelMessage.message = message;
        } else {
          channel.messages.splice(i, 1);
        }
        return {};
      }
      i++;
    }
  }

  for (const dm of data.dms) {
    let j = 0;
    for (const dmMessage of dm.messages) {
      if (dmMessage.uId === uId &&
        dmMessage.messageId === messageId) {
        if (message !== '') {
          dmMessage.message = message;
        } else {
          dm.messages.splice(j, 1);
        }
        return {};
      }
      j++;
    }
  }

  return ERROR;
}
