import { getData, setData } from './dataStore';
import { checkToken, tokenToAuthUserId } from './channelHelperFunctions';
const ERROR = { error: 'error' };

function dmCreateV1(token: string, uIds: number[]) {
  /*
    Description:
      dmCreateV1 function will create a dm with members: supplied uIds
      and creator to be the caller.

    Arguments:
      token     string type   -- Input string supplied by user
      uIds      array type    -- Input array supplied by user

    Return Value:
      object: return {dmId: dmId}
      object: return {error: 'error'}
  */

  const data: any = getData();

  if (!(checkToken(token))) {
    return ERROR;
  }

  if (typeof uIds !== 'object' || uIds.length === 0) {
    return ERROR;
  }

  const newCreatorId: number = tokenToAuthUserId(token).authUserId;
  const newDmId: number = data.dms.length + 1;

  const dmName: string[] = [];

  for (const id of uIds) {
    for (const user of data.users) {
      if (id === user.authUserId) {
        if (dmName.includes(user.handleStr)) {
          return ERROR;
        } else {
          dmName.push(user.handleStr);
        }
      }
    }

    if (id === newCreatorId) {
      return ERROR;
    }
  }

  if (dmName.length !== uIds.length) {
    return ERROR;
  }

  for (const user of data.users) {
    if (user.authUserId === newCreatorId) {
      dmName.push(user.handleStr);
    }
  }

  dmName.sort();

  const newNameString = dmName.toString().split(',').join(', ');

  data.dms.push({
    dmId: newDmId,
    name: newNameString,
    uIds: [...uIds],
    creatorId: newCreatorId,
    messages: []
  });

  setData(data);
  return { dmId: newDmId };
}

function dmListV1(token: string) {
  /*
    Description:
      dmListV1 function will return list of dms that the caller is part of.

    Arguments:
      token     string type   -- Input string supplied by user

    Return Value:
      object: return {dms: [{dmId: dmId, name : name}]}
      object: return {error: 'error'}
  */

  const data: any = getData();
  const dmsList: object[] = [];

  if (!(checkToken(token))) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const dm of data.dms) {
    if (dm.creatorId === authUserId) {
      dmsList.push(
        {
          dmId: dm.dmId,
          name: dm.name
        }
      );
    }

    if (dm.uIds.includes(authUserId)) {
      dmsList.push(
        {
          dmId: dm.dmId,
          name: dm.name
        }
      );
    }
  }

  return {
    dms: [...dmsList]
  };
}

function dmRemoveV1(token: string, dmId: number) {
  /*
    Description:
      dmRemoveV1 function will remove an existing DM, so all members are no longer in the DM,
      original creator of the DM can only remove dms.

    Arguments:
      token     string type   -- Input string supplied by user
      dmId      number type   -- Input number supplied by user

    Return Value:
      object: return {}
      object: return {error: 'error'}
  */

  const data: any = getData();

  if (!(checkToken(token))) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.creatorId === authUserId) {
        const dmIndex = data.dms.indexOf(dm);
        data.dms.splice(dmIndex, 1);
        return {};
      } else {
        return ERROR;
      }
    }
  }
  return ERROR;
}

function dmDetailsV1(token: string, dmId: number) {
  /*
    Description:
      dmDetailsV1 function will provide basic details about the DM.

    Arguments:
      token     string type   -- Input string supplied by user
      dmId      number type   -- Input number supplied by user

    Return Value:
      object: return { name: name, members: [user] }
      object: return {error: 'error'}
  */

  const data: any = getData();

  if (!(checkToken(token))) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.uIds.includes(authUserId) || dm.creatorId === authUserId) {
        const userData: object[] = [];
        for (const user of data.users) {
          if (dm.uIds.includes(user.authUserId)) {
            userData.push(
              {
                uId: user.authUserId,
                email: user.email,
                nameFirst: user.nameFirst,
                nameLast: user.nameLast,
                handleStr: user.handleStr
              }
            );
          } else if (user.authUserId === dm.creatorId) {
            userData.push(
              {
                uId: user.authUserId,
                email: user.email,
                nameFirst: user.nameFirst,
                nameLast: user.nameLast,
                handleStr: user.handleStr
              }
            );
          }
        }
        return {
          name: dm.name,
          members: [...userData]
        };
      } else {
        return ERROR;
      }
    }
  }
  return ERROR;
}

function dmLeaveV1(token: string, dmId: number) {
  /*
    Description:
      dmLeaveV1 function will remove the user as a member of the DM.

    Arguments:
      token     string type   -- Input string supplied by user
      dmId      number type   -- Input number supplied by user

    Return Value:
      object: return {}
      object: return {error: 'error'}
  */

  const data: any = getData();

  if (!(checkToken(token))) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const index = dm.uIds.indexOf(authUserId);
      if (index > -1) {
        dm.uIds.splice(index, 1);
        return {};
      } else if (dm.creatorId === authUserId) {
        dm.creatorId = -1;
        return {};
      }
    }
  }
  return ERROR;
}

export {
  dmCreateV1,
  dmListV1,
  dmRemoveV1,
  dmDetailsV1,
  dmLeaveV1
};
