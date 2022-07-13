import { getData, setData } from './dataStore';
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
        const messageId: number = data.messageId;
        data.messageId += 1;

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

  if (!(checkToken(token))) {
    return ERROR;
  }

  const uId: number = tokenToAuthUserId(token).authUserId;
  let checkMember = false;
  let checkOwner = false;
  for (const channel of data.channels) {
    checkMember = false;
    checkOwner = false;
    for (const member of channel.allMembers) {
      if (member.uId === uId) {
        checkMember = true;
      }
    }
    for (const owner of channel.ownerMembers) {
      if (owner.uId === uId) {
        checkMember = true;
        checkOwner = true;
      }
    }
    let i = 0;
    for (const channelMessage of channel.messages) {
      if ((channelMessage.uId === uId || checkOwner !== false) &&
          channelMessage.messageId === messageId && checkMember !== false) {
        if (message !== '') {
          channelMessage.message = message;
        } else {
          channel.messages.splice(i, 1);
        }
        setData(data);
        return {};
      }
      i++;
    }
  }

  for (const dm of data.dms) {
    checkMember = false;
    checkOwner = false;
    for (const memberId of dm.uId) {
      if (memberId === uId) {
        checkMember = true;
      }
    }
    if (dm.creatorId === uId) {
      checkMember = true;
      checkOwner = true;
    }
    let j = 0;
    for (const dmMessage of dm.messages) {
      if ((dmMessage.uId === uId || checkOwner !== false) &&
          dmMessage.messageId === messageId && checkMember !== false) {
        if (message !== '') {
          dmMessage.message = message;
        } else {
          dm.messages.splice(j, 1);
        }
        setData(data);
        return {};
      }
      j++;
    }
  }

  return ERROR;
}

export function messageSenddmV1(token: string, dmId: number, message: string) {
/*
Description:
messageSenddmV1 send a message from authorisedUser to the DM specified by dmId

Arguments:
token string type -- Input string supplied by user
dmId number type -- Input number supplied by user
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

  for (const dm of data.dms) {
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
  let checkOwner = false;
  for (const channel of data.channels) {
    checkMember = false;
    for (const member of channel.allMembers) {
      if (member.uId === uId) {
        checkMember = true;
      }
    }
    for (const owner of channel.ownerMembers) {
      if (owner.uId === uId) {
        checkMember = true;
        checkOwner = true;
      }
    }
    let i = 0;
    for (const channelMessage of channel.messages) {
      if ((channelMessage.uId === uId || checkOwner !== false) &&
        channelMessage.messageId === messageId && checkMember !== false) {
        channel.messages.splice(i, 1);
        setData(data);
        return {};
      }
      i++;
    }
  }

  for (const dm of data.dms) {
    checkMember = false;
    checkOwner = false;
    for (const memberId of dm.uId) {
      if (memberId === uId) {
        checkMember = true;
      }
    }
    if (dm.creatorId === uId) {
      checkMember = true;
      checkOwner = true;
    }
    let j = 0;
    for (const dmMessage of dm.messages) {
      if ((dmMessage.uId === uId || checkOwner !== false) &&
        dmMessage.messageId === messageId && checkMember !== false) {
        dm.messages.splice(j, 1);
        setData(data);
        return {};
      }
      j++;
    }
  }

  return ERROR;
}
