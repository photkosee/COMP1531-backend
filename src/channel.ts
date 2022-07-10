import { getData, setData } from './dataStore';
import {
  checkAuthUserId,
  checkChannelId,
  checkIfMember,
  authInChannel,
  getMessages,
  checkToken,
  tokenToAuthUserId
} from './channelHelperFunctions';

const ERROR = { error: 'error' };

interface authUserIdObj {
  authUserId?: number
}

function channelJoinV1(token: string, channelId: number) {
/*
  Description:
    channelJoinV1 helps user join a channel

  Arguments:
    token       string type   -- Input integer supplied by user
    channelId   integer type  -- Input integer supplied by user

  Return Value:
    object: returns empty object on success
    object: {error: 'error'}
*/

  if (!(checkToken(token)) || !(checkChannelId(channelId))) {
    return ERROR;
  }

  const authUserIdRet: authUserIdObj = tokenToAuthUserId(token);
  const authUserId: number = authUserIdRet.authUserId;

  const channelDetails: any = checkIfMember(authUserId, channelId);

  if (Object.keys(channelDetails).length !== 0) {
    return ERROR;
  }

  const data: any = getData();

  let chosenChannel: any = {};

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      chosenChannel = channel;

      for (const element of channel.allMembers) {
        if (authUserId === element.uId) {
          return ERROR;
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
      return ERROR;
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

function channelDetailsV1(token: string, channelId: number) {
/*
  Description:
  channelDetailsV1 provide basic details about the channel

  Arguments:
  token       string type    -- Input integer supplied by user
  channelId   integer type   -- Input integer supplied by user

  Return Value:
  object: { name, isPublic, ownerMembers, allMembers }
  object: {error: 'error'}
*/

  if (!(checkToken(token)) && !(checkChannelId(channelId))) {
    return ERROR;
  }

  const authUserIdRet: authUserIdObj = tokenToAuthUserId(token);
  const authUserId: number = authUserIdRet.authUserId;

  const channelDetails: any = checkIfMember(authUserId, channelId);

  if (Object.keys(channelDetails).length === 0) {
    return ERROR;
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
            channel.allMembers.push({
              uId: uId,
              email: element.email,
              nameFirst: element.nameFirst,
              nameLast: element.nameLast,
              handleStr: element.handleStr
            });

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

  const messagesArray = [];
  const messages = getMessages(channelId);

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

export {
  channelMessagesV1,
  channelInviteV1,
  channelJoinV1,
  channelDetailsV1
};
