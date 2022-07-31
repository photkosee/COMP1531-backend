import { getData, setData } from './dataStore';
import { checkToken } from './channelHelperFunctions';
import { checkIfMember, checkChannelId, authInChannel, getHandleStr } from './channelHelperFunctions';
import { checkDmMember, dmIdValidator } from './dmHelperFunctions';
import {
  incrementMessagesSent,
  incrementMessagesExist,
  decreaseMessagesExist
} from './userHelperFunctions';
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
  reacts: newReacts[],
  isPinned: boolean,
}

async function messageSendV1(token: string, authUserId: number, channelId: number, message: string) {
/*
  Description:
    messageSendV1 send a message from the authorised
    user to the channel specified by channelId

  Arguments:
    token       string type   -- string supplied by request header
    authUserId  number type   -- number supplied by request header
    channelId   number type   -- Input number supplied by user
    message     string type   -- Input string supplied by user

  Exceptions:
    BADREQUEST - Occurs when length of message is not valid.
    BADREQUEST - Occurs when channelId is not valid.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when the authorised user is not a member of the channel.

  Return Value:
    object: { messageId: messageId }
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channelId');
  }

  const mentions = message.match(/@\w+/gi) || [];
  const shortMsg = message.slice(0, 20);
  const usersToNotif = [];

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const member of channel.allMembers) {
        const tag = '@' + getHandleStr(member.uId);
        if (mentions.includes(tag)) {
          usersToNotif.push(member.uId);
        }
      }
    }
  }

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      for (const member of channel.allMembers) {
        if (member.uId === authUserId) {
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
          incrementMessagesExist();
          incrementMessagesSent(authUserId);
          for (const user of data.users) {
            if (usersToNotif.includes(user.authUserId)) {
              user.notifications.unshift({
                channelId: channelId,
                dmId: -1,
                notificationMessage: `${getHandleStr(authUserId)} tagged you in ${channel.name}: ${shortMsg}`
              });
            }
          }

          setData(data);
          return { messageId: messageId };
        }
      }
    }
  }

  throw HTTPError(FORBIDDEN, 'You are not a member');
}

async function messageEditV1(token: string, authUserId: number, messageId: number, message: string) {
/*
  Description:
    messageEditV1 given a message, update its text with new text.
    If the new message is an empty string, the message is deleted

  Arguments:
    token       string type   -- string supplied by request header
    authUserId  number type   -- number supplied by request header
    messageId   number type   -- Input number supplied by user
    message     string type   -- Input string supplied by user

  Exceptions:
    BADREQUEST - Occurs when length of message is not valid.
    BADREQUEST - Occurs when messageId does not refer to a valid message.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when authorised user does not have owner permissions and the message was not sent by them.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  message = message.trim();

  if (message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }

  const data: any = getData();
  let permissionId = 0;
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      permissionId = user.permissionId;
    }
  }
  const mentions = message.match(/@\w+/gi) || [];
  const shortMsg = message.slice(0, 20);
  const usersToNotif = [];

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

        for (const member of channel.allMembers) {
          const tag = '@' + getHandleStr(member.uId);
          if (mentions.includes(tag)) {
            usersToNotif.push(member.uId);
          }
        }

        for (const user of data.users) {
          if (usersToNotif.includes(user.authUserId)) {
            user.notifications.unshift({
              channelId: channel.channelId,
              dmId: -1,
              notificationMessage: `${getHandleStr(authUserId)} tagged you in ${channel.name}: ${shortMsg}`
            });
          }
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
        for (const member of dm.uIds) {
          const tag = '@' + getHandleStr(member);
          if (mentions.includes(tag)) {
            usersToNotif.push(member);
          }
        }
        if (mentions.includes('@' + getHandleStr(dm.creatorId))) {
          usersToNotif.push(dm.creatorId);
        }
        for (const user of data.users) {
          if (usersToNotif.includes(user.authUserId)) {
            user.notifications.unshift({
              channelId: -1,
              dmId: dm.dmId,
              notificationMessage: `${getHandleStr(authUserId)} tagged you in ${dm.name}: ${shortMsg}`
            });
          }
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

async function messageSenddmV1(token: string, authUserId: number, dmId: number, message: string) {
/*
  Description:
    messageSenddmV1 send a message from authorisedUser to the DM specified by dmId

  Arguments:
    token       string type -- string supplied by request header
    authUserId  number type -- number supplied by request header
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

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
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

  const mentions = message.match(/@\w+/gi) || [];
  const shortMsg = message.slice(0, 20);
  const usersToNotif = [];
  let dmName = '';
  for (const dm of data.dms) {
    if (dmId === dm.dmId) {
      dmName = dm.name;
      for (const member of dm.uIds) {
        const tag = '@' + getHandleStr(member);
        if (mentions.includes(tag)) {
          usersToNotif.push(member);
        }
      }
      if (mentions.includes('@' + getHandleStr(dm.creatorId))) {
        usersToNotif.push(dm.creatorId);
      }
    }
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
      for (const user of data.users) {
        if (usersToNotif.includes(user.authUserId)) {
          user.notifications.unshift({
            channelId: -1,
            dmId: dmId,
            notificationMessage: `${getHandleStr(authUserId)} tagged you in ${dmName}: ${shortMsg}`
          });
        }
      }
      dm.messages.unshift(newMessagesDetails);
      incrementMessagesExist();
      incrementMessagesSent(authUserId);
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
        for (const user of data.users) {
          if (usersToNotif.includes(user.authUserId)) {
            user.notifications.unshift({
              channelId: -1,
              dmId: dmId,
              notificationMessage: `${getHandleStr(authUserId)} tagged you in ${dmName}: ${shortMsg}`
            });
          }
        }
        dm.messages.unshift(newMessagesDetails);

        incrementMessagesExist();
        incrementMessagesSent(authUserId);
        setData(data);

        return { messageId: messageId };
      }
    }
  }

  throw HTTPError(FORBIDDEN, 'Not a member');
}

async function messageRemoveV1(token: string, authUserId: number, messageId: number) {
/*
  Description:
    messageRemoveV1 given a messageId for a message,
    this message is removed from the channel/DM

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  numer  type -- Input number supplied by request header
    messageId   number type -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when messageId does not refer to a valid message.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when authorised user does not have owner permissions, and the message was not sent by them.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token, authUserId))) {
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
        decreaseMessagesExist();
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
        decreaseMessagesExist();
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

async function messageReactV1(token: string, authUserId: number, messageId: number, reactId: number) {
/*
  Description:
    messageReactV1 given a messageId for a message and a reactId,
    react to that message

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  number type -- Input number supplied by request header
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

  if (!(await checkToken(token, authUserId))) {
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
      const handleStr = getHandleStr(authUserId);
      const messageSender = channel.messages[index].uId;
      if (checkIfMember(messageSender, channel.channelId)) {
        for (const user of data.users) {
          if (user.authUserId === messageSender) {
            user.notifications.unshift({
              channelId: channel.channelId,
              dmId: -1,
              notificationMessage: `${handleStr} reacted to your message in ${channel.name}`
            });
          }
        }
      }

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
      const handleStr = getHandleStr(authUserId);
      const messageSender = dm.messages[index].uId;
      for (const user of data.users) {
        if (user.authUserId === messageSender) {
          user.notifications.unshift({
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: `${handleStr} reacted to your message in ${dm.name}`
          });
        }
      }
      dm.messages[index].reacts[reactId - 1].uIds.push(authUserId);
      return {};
    }
  }

  throw HTTPError(BADREQUEST, 'Invalid messageId');
}

async function messageUnreactV1(token: string, authUserId: number, messageId: number, reactId: number) {
/*
  Description:
    messageUnreactV1 given a messageId for a message and a reactId,
    unreact to that message

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  number type -- Input number supplied by request header
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

  if (!(await checkToken(token, authUserId))) {
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

async function messagePinV1(token: string, authUserId: number, messageId: number) {
/*
  Description:
    messagePinV1 given a messageId for a message,
    pin that message

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  number type -- Input number supplied by request header
    messageId   number type -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when messageId does not refer to a valid message or the user not being a member.
    BADREQUEST - Occurs when the message is already pinned.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when authorised user does not have owner permissions.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token, authUserId))) {
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
      if (permissionId === 1 || channel.ownerMembers.some((object: { uId: number; }) => object.uId === authUserId)) {
        if (channel.messages[index].isPinned === true) {
          throw HTTPError(BADREQUEST, 'Already pinned');
        }
        channel.messages[index].isPinned = true;
        return {};
      }
      checkErrorPermission = true;
    }
  }

  for (const dm of data.dms) {
    const index: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      if (dm.creatorId === authUserId) {
        if (dm.messages[index].isPinned === true) {
          throw HTTPError(BADREQUEST, 'Already pinned');
        }
        dm.messages[index].isPinned = true;
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

async function messageUnpinV1(token: string, authUserId: number, messageId: number) {
/*
  Description:
    messageUnpinV1 given a messageId for a message,
    unpin that message

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  number type -- Input number supplied by request header
    messageId   number type -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when messageId does not refer to a valid message or the user not being a member.
    BADREQUEST - Occurs when the message is not already pinned.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when authorised user does not have owner permissions.

  Return Value:
    object: {}
*/

  if (!(await checkToken(token, authUserId))) {
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
      if (permissionId === 1 || channel.ownerMembers.some((object: { uId: number; }) => object.uId === authUserId)) {
        if (channel.messages[index].isPinned === false) {
          throw HTTPError(BADREQUEST, 'Not already pinned');
        }
        channel.messages[index].isPinned = false;
        return {};
      }
      checkErrorPermission = true;
    }
  }

  for (const dm of data.dms) {
    const index: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === messageId);
    if (index > -1 && (checkDmMember(dm.dmId, authUserId))) {
      if (dm.creatorId === authUserId) {
        if (dm.messages[index].isPinned === false) {
          throw HTTPError(BADREQUEST, 'Not already pinned');
        }
        dm.messages[index].isPinned = false;
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

async function messageShareV1(token: string, authUserId: number, ogMessageId: number, message: string, channelId: number, dmId: number) {
/*
  Description:
    messageSendV1 send a message from the authorised
    user to the channel specified by channelId

  Arguments:
    token       string type   -- string supplied by request header
    authUserId  number type   -- number supplied by request header
    ogMessageId number type   -- Input number supplied by user
    message     string type   -- Input string supplied by user
    channelId   number type   -- Input number supplied by user
    dmId        number type   -- Input number supplied by user

  Exceptions:
    BADREQUEST - Occurs when channelId and dmId are not valid.
    BADREQUEST - Occurs when neither channelId nor dmId are -1.
    BADREQUEST - Occurs when length of message is not valid.
    BADREQUEST - Occurs when ogMessageId is not valid.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.
    FORBIDDEN  - Occurs when the authorised user is not a member of the channel/dm the usre is sharing to.

  Return Value:
    object: { shareMessageId: messageId }
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(BADREQUEST, 'One of them has to be -1');
  }
  if (message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }
  if (!checkChannelId(channelId) && dmId === -1) {
    throw HTTPError(BADREQUEST, 'Invalid channelId');
  }
  if (!dmIdValidator(dmId) && channelId === -1) {
    throw HTTPError(BADREQUEST, 'Invalid dmId');
  }
  if (!authInChannel(channelId, authUserId) && dmId === -1) {
    throw HTTPError(FORBIDDEN, 'Not a member of the channel you are sharing to');
  }
  if (!checkDmMember(dmId, authUserId) && channelId === -1) {
    throw HTTPError(FORBIDDEN, 'Not a member of the dm you are sharing to');
  }

  const data: any = getData();
  // share between channel to channel
  for (const channel of data.channels) {
    const index1: number = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === ogMessageId);
    if (index1 > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      const ogMessage1: string = channel.messages[index1].message;
      for (const shareChannel of data.channels) {
        if (shareChannel.channelId === channelId) {
          const messageId: number = data.messageId;
          data.messageId += 1;

          const newMessagesDetails: newMessagesDetails = {
            messageId: messageId,
            uId: authUserId,
            message: ogMessage1 + message,
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

          return { shareMessageId: messageId };
        }
      }
    }
  }
  // share between dm to dm
  for (const dm of data.dms) {
    const index2: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === ogMessageId);
    if (index2 > -1 && checkDmMember(dm.dmId, authUserId)) {
      const ogMessage2: string = dm.messages[index2].message;
      for (const shareDm of data.dms) {
        if (shareDm.dmId === dmId && shareDm.creatorId === authUserId) {
          const messageId: number = data.messageId;
          data.messageId += 1;
          const newMessagesDetails: newMessagesDetails = {
            messageId: messageId,
            uId: authUserId,
            message: ogMessage2 + message,
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

          return { shareMessageId: messageId };
        }
        for (const member of shareDm.uIds) {
          if (dmId === shareDm.dmId && member === authUserId) {
            const messageId: number = data.messageId;
            data.messageId += 1;
            const newMessagesDetails: newMessagesDetails = {
              messageId: messageId,
              uId: authUserId,
              message: ogMessage2 + message,
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

            return { shareMessageId: messageId };
          }
        }
      }
    }
  }
  // share from dm to channel
  for (const dm of data.dms) {
    const index3: number = dm.messages.findIndex((object: { messageId: number; }) => object.messageId === ogMessageId);
    if (index3 > -1 && checkDmMember(dm.dmId, authUserId)) {
      const ogMessage3: string = dm.messages[index3].message;
      for (const shareChannel of data.channels) {
        if (shareChannel.channelId === channelId) {
          const messageId: number = data.messageId;
          data.messageId += 1;

          const newMessagesDetails: newMessagesDetails = {
            messageId: messageId,
            uId: authUserId,
            message: ogMessage3 + message,
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

          return { shareMessageId: messageId };
        }
      }
    }
  }
  // share from channel to dm
  for (const channel of data.channels) {
    const index4: number = channel.messages.findIndex((object: { messageId: number; }) => object.messageId === ogMessageId);
    if (index4 > -1 && (checkIfMember(authUserId, channel.channelId) !== {})) {
      const ogMessage4: string = channel.messages[index4].message;
      for (const shareDm of data.dms) {
        if (shareDm.dmId === dmId && shareDm.creatorId === authUserId) {
          const messageId: number = data.messageId;
          data.messageId += 1;
          const newMessagesDetails: newMessagesDetails = {
            messageId: messageId,
            uId: authUserId,
            message: ogMessage4 + message,
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

          return { shareMessageId: messageId };
        }
        for (const member of shareDm.uIds) {
          if (dmId === shareDm.dmId && member === authUserId) {
            const messageId: number = data.messageId;
            data.messageId += 1;
            const newMessagesDetails: newMessagesDetails = {
              messageId: messageId,
              uId: authUserId,
              message: ogMessage4 + message,
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

            return { shareMessageId: messageId };
          }
        }
      }
    }
  }

  throw HTTPError(BADREQUEST, 'Invalid ogMessageId');
}

async function messageSendlaterV1(token: string, authUserId: number, channelId: number, message: string, timeSent: number) {
  /*
    Description:
      messageSendlaterV1 send a message from the authorised
      user to the channel specified by channelId at a given time

    Arguments:
      token       string type   -- string supplied by request header
      authUserId  number type   -- number supplied by request header
      channelId   number type   -- number supplied by user
      message     string type   -- string supplied by user
      timeSent    number type   -- number supplied by user

    Exceptions:
      BADREQUEST - Occurs when channelId is invalid.
      BADREQUEST - Occurs when length of message is not valid.
      BADREQUEST - Occurs when timeSent is before current time
      FORBIDDEN  - Occurs when sessionId/token is not found in database.
      FORBIDDEN  - Occurs when the authorised user is not a member of the channel

    Return Value:
      object: { messageId: messageId }
  */
  const data: any = getData();
  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }
  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channelId');
  }
  if (!authInChannel(channelId, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User not member of channel');
  }
  if (message.length > 1000 || message.length < 1) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }
  if (timeSent < Math.floor(Date.now() / 1000)) {
    throw HTTPError(BADREQUEST, 'Time sent is before current time');
  }

  const now = Math.floor(Date.now() / 1000);
  const millisecTillSend = 1000 * (timeSent - now);

  const messageId: number = data.messageId;
  data.messageId += 1;

  const newMessagesDetails: newMessagesDetails = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: timeSent,
    reacts: [],
    isPinned: false,
  };

  const newReactsDetails: newReacts = {
    reactId: 1,
    uIds: [],
    isThisUserReacted: false,
  };
  newMessagesDetails.reacts.push(newReactsDetails);

  function addMessage() {
    for (const channel of data.channels) {
      if (channelId === channel.channelId) {
        channel.messages.unshift(newMessagesDetails);
        setData(data);
      }
    }
  }

  setTimeout(addMessage, millisecTillSend);

  return { messageId: newMessagesDetails.messageId };
}

async function messageSendlaterdmV1(token: string, authUserId: number, dmId: number, message: string, timeSent: number) {
  /*
    Description:
      messageSendlaterV1 send a message from the authorised
      user to the channel specified by channelId at a given time

    Arguments:
      token       string type   -- string supplied by request header
      authUserId  number type   -- number supplied by request header
      channelId   number type   -- number supplied by user
      message     string type   -- string supplied by user
      timeSent    number type   -- number supplied by user

    Exceptions:
      BADREQUEST - Occurs when channelId is invalid.
      BADREQUEST - Occurs when length of message is not valid.
      BADREQUEST - Occurs when timeSent is before current time
      FORBIDDEN  - Occurs when sessionId/token is not found in database.
      FORBIDDEN  - Occurs when the authorised user is not a member of the channel

    Return Value:
      object: { messageId: messageId }
  */
  
  const data: any = getData();
  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }
  if (!dmIdValidator(dmId)) {
    throw HTTPError(BADREQUEST, 'Invalid dmId');
  }
  if (!checkDmMember(dmId, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User not member of dm');
  }
  if (message.length > 1000 || message.length < 1) {
    throw HTTPError(BADREQUEST, 'Invalid message length');
  }
  if (timeSent < Math.floor(Date.now() / 1000)) {
    throw HTTPError(BADREQUEST, 'Time sent is before current time');
  }

  const now = Math.floor(Date.now() / 1000);
  const millisecTillSend = 1000 * (timeSent - now);

  let newMessage = { messageId: 1};
  function sendMessage() {
    for (const dm of data.dms) {
      if (dmId === dm.dmId && dm.creatorId === authUserId) {
        const messageId: number = data.messageId;
        data.mesageId += 1;
        const newMessagesDetails: newMessagesDetails = {
          messageId: messageId,
          uId: authUserId,
          message: message,
          timeSent: timeSent,
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
  
        newMessage = { messageId: messageId };
      }
      for (const member of dm.uIds) {
        if (dmId === dm.dmId && member === authUserId) {
          const messageId: number = data.messageId;
          data.messageId += 1;
          const newMessagesDetails: newMessagesDetails = {
            messageId: messageId,
            uId: authUserId,
            message: message,
            timeSent: timeSent,
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
  
          newMessage = { messageId: messageId };
        }
      }
    }
  }
  setTimeout(sendMessage, millisecTillSend);
  return newMessage;
}

export {
  messageSendV1,
  messageEditV1,
  messageSenddmV1,
  messageRemoveV1,
  messageReactV1,
  messageUnreactV1,
  messagePinV1,
  messageUnpinV1,
  messageShareV1,
  messageSendlaterV1,
  messageSendlaterdmV1
};
