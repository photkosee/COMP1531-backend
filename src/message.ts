import { getData, setData } from './dataStore';
import { checkToken } from './channelHelperFunctions';
import { checkIfMember, checkChannelId } from './channelHelperFunctions';
import { checkDmMember } from './dmHelperFunctions';
import HTTPError from 'http-errors';

const BADREQUEST = 400;
const FORBIDDEN = 403;

interface newReacts {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean,
}

interface newMessagesDetails {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: object[],
  isPinned: boolean,
}

export async function messageSendV1(token: string, authUserId: number, channelId: number, message: string) {
/*
  Description:
    messageSendV1 send a message from the authorised
    user to the channel specified by channelId

  Arguments:
    token     string type   -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header
    channelId number type   -- Input number supplied by user
    message   string type   -- Input string supplied by user

  Exceptions:
    BADREQUEST - Occurs when length of message is not valid.
    BADREQUEST - Occurs when channelId is not valid.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when the authorised user is not a member of the channel.

  Return Value:
    interger: { messageId: messageId }
*/
  const data: any = getData();

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channelId');
  }

  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (channelId === channel.channelId && member.uId === authUserId) {
        const messageId: number = data.messageId;
        data.messageId += 1;

        const newMessagesDetails: newMessagesDetails = {
          messageId: messageId,
          uId: authUserId,
          message: message,
          timeSent: Math.floor((new Date()).getTime() / 1000),
          reacts: [],
          isPinned: false,
        };

        const newReactsDetails: newReacts = {
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        };
        newMessagesDetails.reacts.push(newReactsDetails);

        channel.messages.unshift(newMessagesDetails);
        setData(data);

        return { messageId: messageId };
      }
    }
  }

  throw HTTPError(FORBIDDEN, 'You are not a member');
}

export async function messageEditV1(token: string, authUserId: number, messageId: number, message: string) {
/*
  Description:
    messageEditV1 given a message, update its text with new text.
    If the new message is an empty string, the message is deleted

  Arguments:
    token     string type   -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header
    messageId number type   -- Input number supplied by user
    message   string type   -- Input string supplied by user

  Exceptions:
    BADREQUEST - Occurs when length of message is not valid.
    BADREQUEST - Occurs when messageId does not refer to a valid message.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when authorised user does not have owner permissions and the message was not sent by them.

  Return Value:
    object: {}
*/
  message = message.trim();
  if (message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  let permissionId = 0;
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      permissionId = user.permissionId;
    }
  }
  let checkErrorPermission = false;
  for (const channel of data.channels) {
    const index: number = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      const msgSenderId: number = channel.messages[index].uId;
      if (permissionId === 1 || msgSenderId === authUserId || channel.ownerMembers.some((object: { uId: number; }) => object.uId === authUserId)) {
        if (message.length !== 0) {
          channel.messages[index].message = message;
        } else {
          channel.messages.splice(index, 1);
        }
        return {};
      }
      checkErrorPermission = true;
    }
  }

  for (const dm of data.dms) {
    const index: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      const msgSenderId: number = dm.messages[index].uId;
      if (msgSenderId === authUserId || dm.creatorId === authUserId) {
        if (message.length !== 0) {
          dm.messages[index].message = message;
        } else {
          dm.messages.splice(index, 1);
        }
        return {};
      }
      checkErrorPermission = true;
    }
  }

  if (checkErrorPermission === true) {
    throw HTTPError(FORBIDDEN, 'Have no permission');
  }
  throw HTTPError(BADREQUEST, 'Invalid messageId');
}

export async function messageSenddmV1(token: string, authUserId: number, dmId: number, message: string) {
/*
  Description:
    messageSenddmV1 send a message from authorisedUser to the DM specified by dmId

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header
    dmId        number type -- Input number supplied by user
    message     string type -- Input string supplied by user

  Exceptions:
    BADREQUEST - Occurs when length of message is not valid.
    BADREQUEST - Occurs when length of dmId is not valid.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when the user is not a member.

  Return Value:
    object: { messageId: messageId }
*/
  const data: any = getData();

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  let checkDm = false;
  for (const dm of data.dms) {
    if (dmId === dm.dmId) {
      checkDm = true;
    }
  }
  if (!checkDm) {
    throw HTTPError(BADREQUEST, 'Invalid dmId');
  }

  for (const dm of data.dms) {
    if (dmId === dm.dmId && dm.creatorId === authUserId) {
      const messageId: number = data.messageId;
      data.messageId += 1;
      const newMessagesDetails: newMessagesDetails = {
        messageId: messageId,
        uId: authUserId,
        message: message,
        timeSent: Math.floor((new Date()).getTime() / 1000),
        reacts: [],
        isPinned: false,
      };

      const newReactsDetails: newReacts = {
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      };
      newMessagesDetails.reacts.push(newReactsDetails);

      dm.messages.unshift(newMessagesDetails);
      setData(data);

      return { messageId: messageId };
    }
    for (const member of dm.uIds) {
      if (dmId === dm.dmId && member === authUserId) {
        const messageId: number = data.messageId;
        data.messageId += 1;
        const newMessagesDetails: newMessagesDetails = {
          messageId: messageId,
          uId: authUserId,
          message: message,
          timeSent: Math.floor((new Date()).getTime() / 1000),
          reacts: [],
          isPinned: false,
        };

        const newReactsDetails: newReacts = {
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        };
        newMessagesDetails.reacts.push(newReactsDetails);

        dm.messages.unshift(newMessagesDetails);
        setData(data);

        return { messageId: messageId };
      }
    }
  }

  throw HTTPError(FORBIDDEN, 'Not a member');
}

export async function messageRemoveV1(token: string, authUserId: number, messageId: number) {
/*
  Description:
    messageRemoveV1 given a messageId for a message,
    this message is removed from the channel/DM

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header
    messageId   number type -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when messageId does not refer to a valid message.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when authorised user does not have owner permissions, and the message was not sent by them.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  let permissionId = 0;
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      permissionId = user.permissionId;
    }
  }
  let checkErrorPermission = false;
  for (const channel of data.channels) {
    const index: number = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      const msgSenderId: number = channel.messages[index].uId;
      if (permissionId === 1 || msgSenderId === authUserId || channel.ownerMembers.some((object: { uId: number; }) => object.uId === authUserId)) {
        channel.messages.splice(index, 1);
        return {};
      }
      checkErrorPermission = true;
    }
  }

  for (const dm of data.dms) {
    const index: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      const msgSenderId: number = dm.messages[index].uId;
      if (msgSenderId === authUserId || dm.creatorId === authUserId) {
        dm.messages.splice(index, 1);
        return {};
      }
      checkErrorPermission = true;
    }
  }

  if (checkErrorPermission === true) {
    throw HTTPError(FORBIDDEN, 'Have no permission');
  }
  throw HTTPError(BADREQUEST, 'Invalid messageId');
}

export async function messageReactV1(token: string, authUserId: number, messageId: number, reactId: number) {
/*
  Description:
    messageReactV1 given a messageId for a message and a reactId,
    react to that message

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header
    messageId   number type -- Input number supplied by user
    reactId     number type -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when messageId does not refer to a valid message or the user not being a member.
    BADREQUEST - Occurs when reactId does not refer to a valid react.
    BADREQUEST - Occurs when the message is containing user's react.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  if (reactId < 1 || reactId > data.numReacts) {
    throw HTTPError(BADREQUEST, 'Invalid reactId');
  }

  for (const channel of data.channels) {
    const index: number = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      for (const id of channel.messages[index].reacts[reactId - 1].uIds) {
        if (id === authUserId) {
          throw HTTPError(BADREQUEST, 'Already reacted');
        }
      }
      channel.messages[index].reacts[reactId - 1].uIds.push(authUserId);
      return {};
    }
  }

  for (const dm of data.dms) {
    const index: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      for (const id of dm.messages[index].reacts[reactId - 1].uIds) {
        if (id === authUserId) {
          throw HTTPError(BADREQUEST, 'Already reacted');
        }
      }
      dm.messages[index].reacts[reactId - 1].uIds.push(authUserId);
      return {};
    }
  }

  throw HTTPError(BADREQUEST, 'Invalid messageId');
}

export async function messageUnreactV1(token: string, authUserId: number, messageId: number, reactId: number) {
/*
  Description:
    messageUnreactV1 given a messageId for a message and a reactId,
    unreact to that message

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header
    messageId   number type -- Input number supplied by user
    reactId     number type -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when messageId does not refer to a valid message or the user not being a member.
    BADREQUEST - Occurs when reactId does not refer to a valid react.
    BADREQUEST - Occurs when there's no reacts to unreact.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  if (reactId < 1 || reactId > data.numReacts) {
    throw HTTPError(BADREQUEST, 'Invalid reactId');
  }

  for (const channel of data.channels) {
    const index: number = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      let idIndex = 0;
      for (const id of channel.messages[index].reacts[reactId - 1].uIds) {
        if (id === authUserId) {
          channel.messages[index].reacts[reactId - 1].uIds.splice(idIndex, 1);
          return {};
        }
        idIndex++;
      }
    }
  }

  for (const dm of data.dms) {
    const index: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      let idIndex = 0;
      for (const id of dm.messages[index].reacts[reactId - 1].uIds) {
        if (id === authUserId) {
          dm.messages[index].reacts[reactId - 1].uIds.splice(idIndex, 1);
          return {};
        }
        idIndex++;
      }
    }
  }

  throw HTTPError(BADREQUEST, 'Invalid messageId or no reacts');
}
