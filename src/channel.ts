import { getData } from './dataStore';
import {
  // checkAuthUserId,
  checkChannelId,
  checkIfMember,
  // authInChannel,
  // getMessages,
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
    channelId   integer type -- Input integer supplied by user

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

export {
  // channelMessagesV1,
  // channelInviteV1,
  channelJoinV1,
  channelDetailsV1
};
