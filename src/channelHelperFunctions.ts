import { getData } from './dataStore';

function checkAuthUserId(userId: number) {

    const data: any = getData();
    if (typeof(userId) !== 'number') {
      return false;
    }
  
    for (const user of data.users) {
      if (userId === user.authUserId) {
        return true;
      }
    }
  
    return false;
}

function checkToken(token: string) {
/*
Description:
checkToken checks validity and existence of authId

Arguments:
token string type   -- Input integer supplied by user

Return Value:
boolean: 'true' if valid, 'false' if invalid or non-existent

*/
  const data: any = getData();
  if (typeof(token) !== 'string') {
    return false;
  }

  for (const user of data.users) {
    if (token === user.token) {
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
channelId integer type   -- Input integer supplied by user

Return Value:
boolean: 'true' if valid, 'false' if invalid or non-existent

*/

  const data: any = getData();

  if (typeof(channelId) !== 'number') {
    return { hi: channelId};
  }

  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      return true;
    }
  }

  return 'generl';
}

function checkIfMember(authUserId: number, channelId: number) {
/*
Description:
checkIfMember checks if given user is a member of the
given channel

Arguments:
authUserId integer type   -- Input integer supplied by user
channelId integer type -- Input integer supplied by user

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

  if (chosenChannel === {}) {
    return {};
  }
  
  if (chosenChannel.allMembers.includes(authUserId)) {
    return chosenChannel;
  }

  return {};
}

function authInChannel(channelId: number, userId: number) {
/*
Description:
authInChannel checks existence of user in channel

Arguments:
channelId	integer type -- Input integer supplied by user
userId integer type -- Input integer supplied by user

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
channelId	integer type   -- Input integer supplied by user

Return Value:
array: messages of a given channelId
*/

  const dataStore: any = getData();

  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      return channel.messages;
    }
  }

  // for (const element of chosenChannel.allMembers) {
  //   if (authUserId === element.uId) {
  //     return chosenChannel;
  //   }
  // }

  return {};
}

function tokenToUserId(token: string) {
  const data: any = getData();

  for (const user of data.users) {
    if (token = user.token) {
      return user.authUserId;
    }
  }

  return;
}

export {
  checkToken,
  checkChannelId,
  checkIfMember,
  authInChannel,
  getMessages,
  tokenToUserId,
  checkAuthUserId
};
