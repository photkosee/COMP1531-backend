import { getData, setData } from './dataStore';
import {
  checkAuthUserId,
  checkChannelId,
  checkIfMember,
  authInChannel,
  getMessages,
  checkToken,
  tokenToAuthUserId,
  authIsOwner,
  authIsGlobalOwner
} from './channelHelperFunctions';
import HTTPError from 'http-errors';

const ERROR = { error: 'error' };
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
      token           string type   -- string supplied by request header
      authUserId      string type   -- string supplied by request header
      channelId   integer type  -- Input integer supplied by user

  Exceptions:
  FORBIDDEN   - Invalid Session ID or Token
  BADREQUETS  - Invalid Channel ID
  BADREQUEST  - User already a member
  FORBIDDEN   - Channel is private and user not global owner

  Return Value:
    object: {error: 'error'}
*/

  if (!(await checkToken(token))) {
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

      for (const element of channel.allMembers) {
        if (authUserId === element.uId) {
          throw HTTPError(BADREQUEST, 'User already a member');
        }
      }
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

  return {};
}

async function channelDetailsV1(token: string, authUserId: number, channelId: number) {
/*
  Description:
    channelDetailsV1 provide basic details about the channel

  Arguments:
    token         string type   -- string supplied by request header
    uthUserId     string type   -- string supplied by request header
    channelId     integer type   -- Input integer supplied by user

  Exeptions:
  FORBIDDEN   - Invalid Session ID or Token
  BADREQUETS  - Invalid Channel ID
  BADREQUETS  - No channels available
  FORBIDDEN   - User is not a member of the channel

  BADREQUEST  - User already a member
  FORBIDDEN   - Channel is private and user not global owner

  Return Value:
    object: {error: 'error'}
*/

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid Channel ID');
  }

  const data: any = getData();
  if (data.channels.length === 0) {
    throw HTTPError(BADREQUEST, 'No channels available');
  }

  const channelDetails: any = checkIfMember(authUserId, channelId);

  if (Object.keys(channelDetails).length === 0) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  return {
    name: channelDetails.name,
    isPublic: channelDetails.isPublic,
    ownerMembers: channelDetails.ownerMembers,
    allMembers: channelDetails.allMembers
  };
}

function channelInviteV1(token: string, channelId: number, uId: number) {
  /*
    Description:
      channelInviteV1 Will invite and add a user into a channel

    Arguments:
      token       string type   -- Input integer supplied by user
      channelId   integer type   -- Input integer supplied by user
      uId         integer type   -- Input integer supplied by user

    Return Value:
      object: {} when user is added
      object: {error: 'error'}
  */

  if (checkAuthUserId(uId) &&
      checkToken(token) &&
      checkChannelId(channelId) &&
      authInChannel(channelId, tokenToAuthUserId(token).authUserId) &&
      !authInChannel(channelId, uId)
  ) {
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

            setData(dataStore);
            return {};
          }
        }
      }
    }
  } else {
    return ERROR;
  }
}

function channelMessagesV1(token: string, channelId: number, start: number) {
  /*
    Description:
      channelMessagesV1 checks the message history of a given channel

    Arguments:
      token       string type   -- Input integer supplied by user
      channelId   integer type   -- Input integer supplied by user
      start       integer type   -- Input integer supplied by user

    Return Value:
      object: {
        messages: [messages],
        start: start,
        end: end,
      }
      object: {error: 'error'}
  */

  if (!checkChannelId(channelId) ||
    !checkToken(token) ||
    !authInChannel(channelId, tokenToAuthUserId(token).authUserId) ||
    start > getMessages(channelId).length ||
    start < 0) {
    return ERROR;
  }

  const messagesArray: any = [];
  const messages: any = getMessages(channelId);

  for (let i = 0; i < 50 && (start + i < messages.length); i++) {
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

function channelAddownerV1(token: string, channelId: number, uId: number) {
  /*
    Description:
      channelAddownerV1 adds owner to a channel

    Arguments:
      token       string type    -- Input integer supplied by user
      channelId   integer type   -- Input integer supplied by user
      uId         integer type   -- Input integer supplied by user

    Return Value:
      object: {} when owner is added
      object: {error: 'error'}
  */
  const authId = tokenToAuthUserId(token).authUserId;
  if (checkChannelId(channelId) &&
      checkToken(token) &&
      checkAuthUserId(uId) &&
      authInChannel(channelId, uId) &&
      authInChannel(channelId, authId) &&
      (authIsOwner(channelId, authId) || authIsGlobalOwner(authId)) &&
      !authIsOwner(channelId, uId)
  ) {
    const dataStore: any = getData();

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
  } else {
    return ERROR;
  }
}

function channelRemoveownerV1(token: string, channelId: number, uId: number) {
  /*
    Description:
      channelRemoveownerV1: user of token removes owner of uId from channel of channelId

    Arguments:
      token       string type    -- Input integer supplied by user
      channelId   integer type   -- Input integer supplied by user
      uId         integer type   -- Input integer supplied by user

    Return Value:
      object: {} when owner is removed
      object: {error: 'error'}
  */
  const authId = tokenToAuthUserId(token).authUserId;
  if (checkChannelId(channelId) &&
      checkToken(token) &&
      checkAuthUserId(uId) &&
      authInChannel(channelId, uId) &&
      authInChannel(channelId, authId) &&
      (authIsOwner(channelId, authId) || authIsGlobalOwner(authId)) &&
      authIsOwner(channelId, uId)

  ) {
    const data: any = getData();
    for (const channel of data.channels) {
      if (channel.channelId === channelId) {
        if (channel.ownerMembers.length === 1) {
          return ERROR;
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
  } else {
    return ERROR;
  }
}

function channelLeaveV1(token: string, channelId: number) {
  /*
    Description:
      channelLeaveV1 makes a user of token leave channel of channelId

    Arguments:
      token       string type    -- Input integer supplied by user
      channelId   integer type   -- Input integer supplied by user

    Return Value:
      object: {} when user is removed
      object: {error: 'error'}
  */
  if (checkChannelId(channelId) &&
      checkToken(token) &&
      authInChannel(channelId, tokenToAuthUserId(token).authUserId)
  ) {
    const dataStore: any = getData();
    const uId: number = tokenToAuthUserId(token).authUserId;
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
            setData(dataStore);
            return {};
          }
        }
      }
    }
  }

  return ERROR;
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
