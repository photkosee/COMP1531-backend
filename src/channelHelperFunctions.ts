import { getData } from './dataStore';

function checkAuthUserId(authUserId: number) {
/*
  Description:
    checkAuthUserId checks validity and existence of authId

  Arguments:
    authUserId  integer type   -- Input integer supplied by user

  Return Value:
    boolean:  'true' if valid, 'false' if invalid or non-existent

*/

  const data: any = getData();

  if (typeof authUserId !== 'number') {
    return false;
  }

  for (const user of data.users) {
    if (authUserId === user.authUserId) {
      return true;
    }
  }

  return false;
}

function checkChannelId(channelId: number) {
/*
  Description:
    checkChannelId checks validity and existence of channelId

  Arguments:
    channelId integer type  -- Input integer supplied by user

  Return Value:
    boolean: 'true' if valid, 'false' if invalid or non-existent

*/

  const data: any = getData();

  if (typeof channelId !== 'number') {
    return false;
  }

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      return true;
    }
  }

  return false;
}

function checkIfMember(authUserId: number, channelId: number) {
/*
  Description:
    checkIfMember checks if given user is a member of the given channel

  Arguments:
    authUserId  integer type   -- Input integer supplied by user
    channelId integer type   -- Input integer supplied by user

  Return Value:
    object: returns details of channel if the user is a member,
            returns empty object if user is not a member

*/

  const data: any = getData();

  let chosenChannel: any = {};

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      chosenChannel = channel;
    }
  }

  for (const element of chosenChannel.allMembers) {
    if (authUserId === element.uId) {
      return chosenChannel;
    }
  }

  return {};
}

function authInChannel(channelId: number, userId: number) {
/*
  Description:
    authInChannel checks existence of user in channel

  Arguments:
    channelId integer type   -- Input integer supplied by user
    userId  integer type   -- Input integer supplied by user

  Return Value:
    boolean: 'true' if user in channel, 'false' if not in channel

*/

  const dataStore: any = getData();

  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      for (const element of channel.allMembers) {
        if (userId === element.uId) {
          return true;
        }
      }
    }
  }

  return false;
}

function getMessages(channelId: number) {
/*
  Description:
    getMessages returns array of messages of a given channelId

  Arguments:
    channelId integer type  -- Input integer supplied by user

  Return Value:
    array:  messages of a given channelId
*/

  const dataStore: any = getData();

  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      return channel.messages;
    }
  }

  return {};
}

function checkToken(token: string) {
/*
  Description:
    checkToken checks validity and existence of token

  Arguments:
    token integer string  -- Input integer supplied by user

  Return Value:
    boolean: 'true' if valid, 'false' if invalid or non-existent

*/

  const data: any = getData();

  if (typeof token !== 'string') {
    return false;
  }

  for (const user of data.users) {
    if (token === user.token) {
      return true;
    }
  }

  return false;
}

function tokenToAuthUserId(token: string) {
/*
  Description:
    tokenToAuthUserId finds authUserId for corresponding token

  Arguments:
    token integer string  --  Input integer supplied by user

  Return Value:
    object: { authUserId: authUserId } on success
    empty object if failed

*/
  const data: any = getData();

  for (const user of data.users) {
    if (token === user.token) {
      return { authUserId: user.authUserId };
    }
  }
  return {};
}

function authIsOwner (channelId: number, uId: number) {
  /*
  Description:
    authIsOwner checks if uId is a owner of channelId

  Arguments:
    channelId integer type  --  Input integer supplied by user
    uId       integer type  --  Input integer supplied by user

  Return Value:
    true: if uId is owner of channelId
    false: if uId is not owner of channelId

*/
  const dataStore: any = getData();

  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      for (const element of channel.ownerMembers) {
        if (uId === element.uId) {
          return true;
        }
      }
    }
  }

  return false;
}

export {
  checkAuthUserId,
  checkChannelId,
  checkIfMember,
  authInChannel,
  getMessages,
  checkToken,
  tokenToAuthUserId,
  authIsOwner
};
