import { getData, setData } from './dataStore';
import { tokenToAuthUserId, checkToken } from './channelHelperFunctions';
import { checkIfMember } from './channelHelperFunctions';
import { checkDmMember } from './dmHelperFunctions';

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
        const messageId: number = data.messageId;
        data.messageId += 1;

        const newMessagesDetails: newMessagesDetails = {
          messageId: messageId,
          uId: uId,
          message: message,
          timeSent: Math.floor((new Date()).getTime() / 1000),
        };

        channel.messages.unshift(newMessagesDetails);
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
    token     string type -- Input string supplied by user
    messageId number type -- Input number supplied by user
    message   string type -- Input string supplied by user

  Return Value:
    object: {}
    object: {error: 'error'}
*/
  message = message.trim();
  if (message.length > 1000) {
    return ERROR;
  }

  if (!(checkToken(token))) {
    return ERROR;
  }

  const data: any = getData();

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const channel of data.channels) {
    const index = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      const msgSenderId = channel.messages[index].uId;
      if (msgSenderId === authUserId || channel.ownerMembers.some((object: { uId: number; }) => object.uId === authUserId)) {
        if (message.length !== 0) {
          channel.messages[index].message = message;
        } else {
          channel.messages.splice(index, 1);
        }
        return {};
      }
    }
  }

  for (const dm of data.dms) {
    const index = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      const msgSenderId = dm.messages[index].uId;
      if (msgSenderId === authUserId || dm.creatorId === authUserId) {
        if (message.length !== 0) {
          dm.messages[index].message = message;
        } else {
          dm.messages.splice(index, 1);
        }
        return {};
      }
    }
  }
  return ERROR;
}

export function messageSenddmV1(token: string, dmId: number, message: string) {
/*
  Description:
    messageSenddmV1 send a message from authorisedUser to the DM specified by dmId

  Arguments:
    token   string type -- Input string supplied by user
    dmId    number type -- Input number supplied by user
    message string type -- Input string supplied by user

  Return Value:
    object: { messageId: messageId }
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
  for (const dm of data.dms) {
    if (dmId === dm.dmId && dm.creatorId === uId) {
      const messageId: number = data.messageId;
      data.messageId += 1;
      const newMessagesDetails: newMessagesDetails = {
        messageId: messageId,
        uId: uId,
        message: message,
        timeSent: Math.floor((new Date()).getTime() / 1000),
      };

      dm.messages.unshift(newMessagesDetails);
      setData(data);

      return { messageId: messageId };
    }
    for (const member of dm.uIds) {
      if (dmId === dm.dmId && member === uId) {
        const messageId: number = data.messageId;
        data.messageId += 1;
        const newMessagesDetails: newMessagesDetails = {
          messageId: messageId,
          uId: uId,
          message: message,
          timeSent: Math.floor((new Date()).getTime() / 1000),
        };

        dm.messages.unshift(newMessagesDetails);
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
    token     string type -- Input string supplied by user
    messageId number type -- Input number supplied by user

  Return Value:
    object: {}
    object: {error: 'error'}
*/

  if (typeof messageId !== 'number') {
    return ERROR;
  }

  if (!(checkToken(token))) {
    return ERROR;
  }

  const data: any = getData();

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const channel of data.channels) {
    const index = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      const msgSenderId = channel.messages[index].uId;
      if (msgSenderId === authUserId || channel.ownerMembers.some((object: { uId: number; }) => object.uId === authUserId)) {
        channel.messages.splice(index, 1);
        return {};
      }
    }
  }

  for (const dm of data.dms) {
    const index = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      const msgSenderId = dm.messages[index].uId;
      if (msgSenderId === authUserId || dm.creatorId === authUserId) {
        dm.messages.splice(index, 1);
        return {};
      }
    }
  }
  return ERROR;
}
