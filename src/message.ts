import { getData, setData, getMessageId, setMessageId } from './dataStore';
import { tokenToAuthUserId, checkToken } from './channelHelperFunctions';

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

  if (!(checkToken(token))) {
    return ERROR;
  }

  const uId: number = tokenToAuthUserId(token).authUserId;

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

export function messageRemoveV1(token: string, messageId: number) {
/*
Description:
messageRemoveV1 given a messageId for a message,
this message is removed from the channel/DM

Arguments:
token string type -- Input string supplied by user
messageId number type -- Input number supplied by user

Return Value:
object: {}
object: {error: 'error'}
*/
  const data: any = getData();

  if (!(checkToken(token))) {
    return ERROR;
  }

  const uId: number = tokenToAuthUserId(token).authUserId;
  let checkMember = false;
  for (const channel of data.channels) {
    checkMember = false;
    for (const member of channel.allMembers) {
      if (member.uId === uId) {
        checkMember = true;
      }
    }
    let i = 0;
    for (const channelMessage of channel.messages) {
      if (channelMessage.uId === uId &&
          channelMessage.messageId === messageId && checkMember !== false) {
        channel.messages.splice(i, 1);
        return {};
      }
      i++;
    }
  }

  for (const dm of data.dms) {
    checkMember = false;
    for (const memberId of dm.uId) {
      if (memberId === uId) {
        checkMember = true;
      }
    }
    let j = 0;
    for (const dmMessage of dm.messages) {
      if (dmMessage.uId === uId &&
          dmMessage.messageId === messageId && checkMember !== false) {
        dm.messages.splice(j, 1);
        return {};
      }
      j++;
    }
  }

  return ERROR;
}
