import { getData, setData } from './dataStore';
import {
  checkAuthUserId,
  checkChannelId,
  checkIfMember,
  authInChannel,
  getMessages,
  checkToken,
  authIsOwner,
  getHandleStr
} from './channelHelperFunctions';
import {
  incrementChannelsJoined,
  decreaseChannelsJoined
} from './userHelperFunctions';
import HTTPError from 'http-errors';

const BADREQUEST = 400;
const FORBIDDEN = 403;

interface newUser {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string
}

async function channelJoinV1(token: string, authUserId: number, channelId: number) {
/*
  Description:
    channelJoinV1 helps user join a channel

  Arguments:
    token       string type   -- string supplied by request header
    authUserId  number type   -- number supplied by request header
    channelId   number type   -- Input integer supplied by user

  Exceptions:
    FORBIDDEN   - Invalid Session ID or Token
    BADREQUETS  - Invalid Channel ID
    BADREQUEST  - User already a member
    FORBIDDEN   - Channel is private and user not global owner

  Return Value:
    object: {}
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid Channel ID');
  }

  const channelDetails: any = checkIfMember(authUserId, channelId);

  if (Object.keys(channelDetails).length !== 0) {
    throw HTTPError(BADREQUEST, 'User already a member');
  }

  const data: any = getData();

  let chosenChannel: any = {};
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      chosenChannel = channel;
    }
  }

  let chosenUser: any = {};
  for (const user of data.users) {
    if (authUserId === user.authUserId) {
      chosenUser = user;
    }
  }

  if (chosenChannel.isPublic === false) {
    if (chosenUser.permissionId !== 1) {
      throw HTTPError(FORBIDDEN, 'Channel is private and user not global owner');
    }
  }

  chosenChannel.allMembers.push({
    uId: authUserId,
    email: chosenUser.email,
    nameFirst: chosenUser.nameFirst,
    nameLast: chosenUser.nameLast,
    handleStr: chosenUser.handleStr
  });

  incrementChannelsJoined(authUserId);

  return {};
}

async function channelDetailsV1(token: string, authUserId: number, channelId: number) {
/*
  Description:
    channelDetailsV1 provide basic details about the channel

  Arguments:
    token         string type   -- string supplied by request header
    authUserId    number type   -- number supplied by request header
    channelId     number type   -- number supplied by user

  Exeptions:
    FORBIDDEN   - Invalid Session ID or Token
    BADREQUETS  - Invalid Channel ID
    BADREQUETS  - No channels available
    FORBIDDEN   - User is not a member of the channel
    BADREQUEST  - User already a member
    FORBIDDEN   - Channel is private and user not global owner

  Return Value:
    object: {
      name: channelDetails.name,
      isPublic: channelDetails.isPublic,
      ownerMembers: channelDetails.ownerMembers,
      allMembers: channelDetails.allMembers,
    }
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  if (data.channels.length === 0) {
    throw HTTPError(BADREQUEST, 'No channels available');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid Channel ID');
  }

  const channelDetails: any = checkIfMember(authUserId, channelId);

  if (Object.keys(channelDetails).length === 0) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  return {
    name: channelDetails.name,
    isPublic: channelDetails.isPublic,
    ownerMembers: channelDetails.ownerMembers,
    allMembers: channelDetails.allMembers,
  };
}

async function channelInviteV1(token: string, authUserId: number, channelId: number, uId: number) {
  /*
    Description:
      channelInviteV1 Will invite and add a user into a channel

    Arguments:
      token         string type   -- string supplied by request header
      authUserId    number type   -- number supplied by request header
      channelId     number type   -- Input number supplied by user
      uId           number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid channelId
      BADREQUEST  - Invalid uId
      BADREQUEST  - uId refers to user who is already in channel
      FORBIDDEN   - User is not member of the channel

    Return Value:
      object: {} when user is added
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channel');
  }

  if (!checkAuthUserId(uId)) {
    throw HTTPError(BADREQUEST, 'User to invite does not exist');
  }

  if (authInChannel(channelId, uId)) {
    throw HTTPError(BADREQUEST, 'User to invite already in channel');
  }

  if (!authInChannel(channelId, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User not in channel so cannot invite others');
  }

  const dataStore: any = getData();

  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      for (const element of dataStore.users) {
        if (uId === element.authUserId) {
          const newMember: newUser =
          {
            uId: uId,
            email: element.email,
            nameFirst: element.nameFirst,
            nameLast: element.nameLast,
            handleStr: element.handleStr
          };
          channel.allMembers.push(newMember);
          const handleStr = getHandleStr(authUserId);
          element.notifications.unshift({
            channelId: channelId,
            dmId: -1,
            notificationMessage: `${handleStr} added you to ${channel.name}`
          });
          incrementChannelsJoined(uId);
          setData(dataStore);
          return {};
        }
      }
    }
  }
}

async function channelMessagesV1(token: string, authUserId: number, channelId: number, start: number) {
  /*
    Description:
      channelMessagesV1 checks the message history of a given channel

    Arguments:
      token       string type   -- string supplied by request header
      authUserId  number type   -- number supplied by request header
      channelId   number type   -- Input number supplied by user
      start       number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid channelId
      BADREQUEST  - Start is invalid
      FORBIDDEN   - User is not member of the channel

    Return Value:
      object: {
        messages: [messages],
        start: start,
        end: end,
      }
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channel');
  }

  if (!authInChannel(channelId, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User is not member of channel');
  }

  if (start > getMessages(channelId).length || start < 0) {
    throw HTTPError(BADREQUEST, 'Start is invalid or greater than total messages');
  }

  const messagesArray: any = [];
  const messages: any = getMessages(channelId);

  for (let i = 0; i < 50 && (start + i < messages.length); i++) {
    let checkAuthUserReact = false;
    for (const id of messages[start + i].reacts[0].uIds) {
      if (id === authUserId) {
        checkAuthUserReact = true;
      }
    }
    messages[start + i].reacts[0].isThisUserReacted = checkAuthUserReact;
    messagesArray.push(messages[start + i]);
  }

  let end = -1;

  if (start + 50 < messages.length) {
    end = start + 50;
  }

  return {
    messages: messagesArray,
    start: start,
    end: end
  };
}

async function channelAddownerV1(token: string, authUserId: number, channelId: number, uId: number) {
  /*
    Description:
      channelAddownerV1 adds owner to a channel

    Arguments:
      token       string type   -- string supplied by request header
      authUserId  number type   -- string supplied by request header
      channelId   number type   -- Input number supplied by user
      uId         number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid channelId
      BADREQUEST  - Invalid uId
      BADREQUEST  - uId is already owner of channel
      FORBIDDEN   - User does not have owner permissions in channel

    Return Value:
      object: {} when owner is added
  */
  const dataStore: any = getData();
  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channel');
  }
  if (!checkAuthUserId(uId)) {
    throw HTTPError(BADREQUEST, 'User to make owner does not exist');
  }
  if (!authInChannel(channelId, uId)) {
    throw HTTPError(BADREQUEST, 'User to make owner is not in channel');
  }
  if (!authInChannel(channelId, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User is not in channel');
  }
  if (authIsOwner(channelId, uId)) {
    throw HTTPError(BADREQUEST, 'User to make owner is already owner');
  }
  let isGlobalOwner = false;
  for (const user of dataStore.users) {
    if (user.uId === authUserId && user.permissionId === 1) {
      isGlobalOwner = true;
    }
  }
  if (!authIsOwner(channelId, authUserId) && !isGlobalOwner) {
    throw HTTPError(FORBIDDEN, 'User does not have owner permissions');
  }

  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      for (const element of dataStore.users) {
        if (uId === element.authUserId) {
          const newOwner: newUser = {
            uId: uId,
            email: element.email,
            nameFirst: element.nameFirst,
            nameLast: element.nameLast,
            handleStr: element.handleStr
          };
          channel.ownerMembers.push(newOwner);

          setData(dataStore);
          return {};
        }
      }
    }
  }
}

async function channelRemoveownerV1(token: string, authUserId: number, channelId: number, uId: number) {
  /*
    Description:
      channelRemoveownerV1: user of token removes owner of uId from channel of channelId

    Arguments:
      token       string type    -- string supplied by request header
      authUserId  number type    -- string supplied by request header
      channelId   integer type   -- Input number supplied by user
      uId         integer type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid channelId
      BADREQUEST  - Invalid uId
      BADREQUEST  - uId is currently not owner of channel
      BADREQUEST  - uId is currently only owner of channel
      FORBIDDEN   - User does not have owner permissions in channel

    Return Value:
      object: {} when owner is removed
  */
  const data: any = getData();
  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channel');
  }
  if (!checkAuthUserId(uId)) {
    throw HTTPError(BADREQUEST, 'User to make owner does not exist');
  }

  if (!authIsOwner(channelId, uId) || !authInChannel(channelId, uId)) {
    throw HTTPError(BADREQUEST, 'User to remove as owner is not a owner');
  }
  let isGlobalOwner = false;
  for (const user of data.users) {
    if (user.uId === authUserId && user.permissionId === 1) {
      isGlobalOwner = true;
    }
  }
  if (!authIsOwner(channelId, authUserId) && !isGlobalOwner) {
    throw HTTPError(FORBIDDEN, 'User does not have owner permissions');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel.ownerMembers.length === 1) {
        throw HTTPError(BADREQUEST, 'Cannot remove last owner of channel');
      }
      for (let i = 0; i < channel.ownerMembers.length; i++) {
        if (channel.ownerMembers[i].uId === uId) {
          channel.ownerMembers.splice(i, 1);
          setData(data);
          return {};
        }
      }
    }
  }
}

async function channelLeaveV1(token: string, authUserId: number, channelId: number) {
  /*
    Description:
      channelLeaveV1 makes a user of token leave channel of channelId

    Arguments:
      token       string type   -- string supplied by request header
      authUserId  number type   -- string supplied by request header
      channelId   number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid channelId
      BADREQUEST  - User is starter of active startup in channel
      FORBIDDEN   - User is not member of the channel

    Return Value:
      object: {} when user is removed
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channel');
  }
  if (!authInChannel(channelId, authUserId)) {
    throw HTTPError(FORBIDDEN, 'User is not in channel');
  }

  const dataStore: any = getData();
  const uId: number = authUserId;
  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      for (let i = 0; i < channel.ownerMembers.length; i++) {
        if (channel.ownerMembers[i].uId === uId) {
          channel.ownerMembers.splice(i, 1);
        }
      }

      for (let i = 0; i < channel.allMembers.length; i++) {
        if (channel.allMembers[i].uId === uId) {
          channel.allMembers.splice(i, 1);
          decreaseChannelsJoined(authUserId);
          setData(dataStore);
          return {};
        }
      }
    }
  }
}

export {
  channelMessagesV1,
  channelInviteV1,
  channelJoinV1,
  channelDetailsV1,
  channelRemoveownerV1,
  channelAddownerV1,
  channelLeaveV1
};
