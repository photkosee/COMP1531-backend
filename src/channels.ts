import { getData, setData } from './dataStore';
import { checkToken } from './channelHelperFunctions';
import HTTPError from 'http-errors';

const BADREQUEST = 400;
const FORBIDDEN = 403;

interface newChannelDetails {
  channelId: number,
  name: string,
  ownerMembers: any,
  allMembers: any,
  isPublic: boolean,
  messages: any,
}

async function channelsListallV1(token: string, authUserId: number) {
/*
  Description:
    channelsListallV1  returning all existing
    channels if the given authUserId is valid

  Arguments:
    token       string type   -- string supplied by request header
    authUserId  number type   -- string supplied by request header

  Exceptions:
    FORBIDDEN  - Occurs when sessionId/token is not found in database.

  Return Value:
    array of object: having details of channelId and name
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  const channels: any = [];

  for (let i = 0; i < data.channels.length; i++) {
    channels.push({
      channelId: data.channels[i].channelId,
      name: data.channels[i].name
    });
  }

  return { channels: channels };
}

async function channelsListV1(token: string, authUserId: number) {
/*
  Description:
    channelsListV1 returning all channels that the
    given authUserId is part of the channels

  Arguments:
    token       string type -- Input string supplied by request header
    authUserId  string type -- Input string supplied by request header

  Exceptions:
    FORBIDDEN  - Occurs when sessionId/token is not found in database.

  Return Value:
    array of object: having details of channelId and name
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  const channels: any = [];

  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].allMembers[j].uId === authUserId) {
        channels.push({
          channelId: data.channels[i].channelId,
          name: data.channels[i].name
        });
      }
    }
  }

  return { channels: channels };
}

async function channelsCreateV1(token: string, authUserId: number, name: string, isPublic: boolean) {
/*
  Description:
    channelsCreateV1  creating a new channel from given authUserId,
    name and set if the channel is private or public.

  Arguments:
    token       string type   -- Input string supplied by request header
    authUserId  string type   -- Input string supplied by request header
    name        string type   -- Input string supplied by user
    isPublic    boolean type  -- Input boolean supplied by user

  Exceptions:
    BADREQUEST - Occurs when length of name is not valid.
    FORBIDDEN  - Occurs when sessionId/token is not found in database.

  Return Value:
    interger: channelId
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (name.length < 1 || name.length > 20) {
    throw HTTPError(BADREQUEST, 'Invalid name length');
  }

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId === authUserId) {
      const channelId: number = (data.channels.length) + 1;

      const newChannelDetails: newChannelDetails = {
        channelId: channelId,
        name: name,
        ownerMembers: [{
          uId: data.users[i].authUserId,
          email: data.users[i].email,
          nameFirst: data.users[i].nameFirst,
          nameLast: data.users[i].nameLast,
          handleStr: data.users[i].handleStr
        }],
        allMembers: [{
          uId: data.users[i].authUserId,
          email: data.users[i].email,
          nameFirst: data.users[i].nameFirst,
          nameLast: data.users[i].nameLast,
          handleStr: data.users[i].handleStr
        }],
        isPublic: isPublic,
        messages: [],
      };

      data.channels.push(newChannelDetails);
      setData(data);

      return { channelId: channelId };
    }
  }
}

export {
  channelsCreateV1,
  channelsListV1,
  channelsListallV1
};
