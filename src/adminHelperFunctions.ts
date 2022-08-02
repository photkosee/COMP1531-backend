import { getData } from './dataStore';

const GLOBAL = 1;

function checkPermissionId(permissionId: number) {
  /*
    Description:
      checkPermissionId checks validity of given permission id

    Arguments:
      permissionId  number type -- number supplied by user

    Return Value:
      boolean:  'true' if valid, 'false' if invalid
  */

  if (typeof (permissionId) !== 'number') {
    return false;
  }

  if (permissionId !== 1 && permissionId !== 2) {
    return false;
  }

  return true;
}

function findPermissionId(userId: number) {
  /*
    Description:
      findPermissionId finds the permission id given a valid user Id

    Arguments:
      userId    number type -- number supplied by header

    Return Value:
      number: 1 if global owner, 2 if member
  */

  const data: any = getData();

  let foundPermissionId = 0;
  for (const user of data.users) {
    if (userId === user.authUserId) {
      foundPermissionId = user.permissionId;
    }
  }

  return foundPermissionId;
}

function isOnlyGlobalOwner(userId: number) {
  /*
    Description:
      isOnlyGlobalOwner determines if user is the only global owner in Treats

    Arguments:
      userId    number type -- number supplied by header

    Return Value:
      boolean:  'true' if they're the only global owner
                'false' if other global owners exist
  */

  const data: any = getData();

  for (const user of data.users) {
    if (userId !== user.authUserId) {
      if (user.permissionId === GLOBAL) {
        return false;
      }
    }
  }

  return true;
}

function replaceUsersMessages(userId: number) {
  /*
    Description:
      replaceUserMessages replaces the user's messages to 'Removed user'

    Arguments:
      userId    number type -- number supplied by user
  */
  const data: any = getData();

  if (data.channels.length === 0) {
    return;
  }

  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (userId === message.uId) {
        message.message = 'Removed user';
      }
    }
  }
}

function replaceUserDms(userId: number) {
  /*
    Description:
      replaceUserDms replaces the user's dms to 'Removed user'

    Arguments:
      userId    number type -- number supplied by user
  */
  const data: any = getData();

  if (data.dms.length === 0) {
    return;
  }

  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (userId === message.uId) {
        message.message = 'Removed user';
      }
    }
  }
}

function removeUserChannelMembers(userId: number) {
  /*
    Description:
      removeUserChannelMembers removes the user from channel members.

    Arguments:
      userId    number type -- number supplied by user
  */

  const data: any = getData();

  if (data.channels.length === 0) {
    return;
  }

  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (userId === member.uId) {
        const index: number = channel.allMembers.indexOf(member);
        channel.allMembers.splice(index, 1);
      }
    }
  }
}

function removeUserChannelOwners(userId: number) {
  /*
    Description:
      removeUserChannelOwners removes the user from channel owners.

    Arguments:
      userId    number type -- number supplied by user
  */

  const data: any = getData();

  if (data.channels.length === 0) {
    return;
  }

  for (const channel of data.channels) {
    for (const member of channel.ownerMembers) {
      if (userId === member.uId) {
        const index: number = channel.ownerMembers.indexOf(member);
        channel.ownerMembers.splice(index, 1);
      }
    }
  }
}

function removeUserFromDms(userId: number) {
  /*
    Description:
      removeUserFromDMs removes the user from dms.

    Arguments:
      userId    number type -- number supplied by user
  */

  const data: any = getData();

  if (data.dms.length === 0) {
    return;
  }

  for (const dm of data.dms) {
    if (dm.uIds.includes(userId)) {
      const index: number = dm.uIds.indexOf(userId);
      dm.uIds.splice(index, 1);
    }
  }

  for (const dm of data.dms) {
    if (dm.creatorId === userId) {
      dm.creatorId = -1;
    }
  }
}

export {
  removeUserChannelMembers,
  removeUserChannelOwners,
  replaceUsersMessages,
  removeUserFromDms,
  isOnlyGlobalOwner,
  checkPermissionId,
  findPermissionId,
  replaceUserDms
};
