import env from './env.json';
import { getData } from './dataStore';
import { getHashOf } from './authHelperFunctions';

function checkAuthUserId(authUserId: number) {
  /*
    Description:
      checkAuthUserId checks validity and existence of authId

    Arguments:
      authUserId  number type   -- Input integer supplied by user

    Return Value:
      boolean:  'true' if valid, 'false' if invalid or non-existent
  */

  const data: any = getData();

  for (const user of data.users) {
    if (authUserId === user.authUserId && user.isActive === true) {
      return true;
    }
  }

  return false;
}

function checkAuthUserIdProfile(authUserId: number) {
  /*
    Description:
      checkAuthUserId checks validity and existence of authId, includes inactive accounts

    Arguments:
      authUserId  number type   -- Input integer supplied by user

    Return Value:
      boolean:  'true' if valid, 'false' if invalid or non-existent
  */

  const data: any = getData();

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
      channelId   integer type  -- Input integer supplied by user

    Return Value:
      boolean: 'true' if valid, 'false' if invalid or non-existent
  */

  const data: any = getData();

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
      channelId   integer type   -- Input integer supplied by user

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
      userId    integer type   -- Input integer supplied by user

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
}

function checkToken(token: string, authUserId: number) {
  /*
    Description:
      checkToken checks validity and existence of sessionId/token

    Arguments:
      token       string    -- Input string supplied by user
      authUserId  number    -- Input integer supplied by user

    Return Value:
      boolean: 'true' if valid, 'false' if invalid or non-existent
  */

  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId && user.isActive === true) {
      for (const sessionId of user.sessionList) {
        if (getHashOf(sessionId + env.secret) === token) {
          return true;
        }
      }
    }
  }

  return false;
}

function checkTokenProfile(token: string, authUserId: number) {
  /*
    Description:
      checkToken checks validity and existence of sessionId/token, includes inactive users

    Arguments:
      token       string    -- Input string supplied by user
      authUserId  number    -- Input integer supplied by user

    Return Value:
      boolean: 'true' if valid, 'false' if invalid or non-existent
  */

  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      for (const sessionId of user.sessionList) {
        if (getHashOf(sessionId + env.secret) === token) {
          return true;
        }
      }
    }
  }

  return false;
}

function authIsOwner(channelId: number, uId: number) {
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

function getHandleStr(uId: number) {
  /*
    Description:
      getHandleStr gets handleStr of user

    Arguments:
      uId       integer type  --  Input integer supplied by user

    Return Value:
      handleStr: success
  */

  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === uId) {
      return user.handleStr;
    }
  }
}

export {
  checkAuthUserIdProfile,
  checkTokenProfile,
  checkAuthUserId,
  checkChannelId,
  authInChannel,
  checkIfMember,
  getHandleStr,
  getMessages,
  authIsOwner,
  checkToken
};
