import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { checkToken, tokenToAuthUserId } from './channelHelperFunctions';
import { dmIdValidator, checkDmMember, getDmMessages } from './dmHelperFunctions';

const BADREQUEST = 400;
const FORBIDDEN = 403;
const ERROR = { error: 'error' };

async function dmCreateV1(token: string, authUserId: number, uIds: number[]) {
  /*
    Description:
      dmCreateV1 function will create a dm with members: supplied uIds
      and creator to be the caller.

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      string type   -- string supplied by request header
      uIds            array type    -- Input array supplied by user

    Exceptions:
      BADREQUEST - Occurs when any uId in uIds does not refer to a valid user.
      BADREQUEST - Occurs when there are duplicate 'uId's in uIds.
      BADREQUEST - Occurs when received invalid data type.
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: return {dmId: dmId}
  */

  const data: any = getData();

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (typeof uIds !== 'object' || uIds.length === 0) {
    throw HTTPError(BADREQUEST, 'Received invalid data type');
  }

  const newCreatorId = authUserId;
  const newDmId: number = data.dmId;

  data.dmId += 1;

  const dmName: string[] = [];

  for (const id of uIds) {
    for (const user of data.users) {
      if (id === user.authUserId) {
        if (dmName.includes(user.handleStr)) {
          throw HTTPError(BADREQUEST, 'There are duplicate \'uId\'s in uIds');
        } else {
          dmName.push(user.handleStr);
        }
      }
    }

    if (id === newCreatorId) {
      throw HTTPError(BADREQUEST, 'uIds should not include creator');
    }
  }

  if (dmName.length !== uIds.length) {
    throw HTTPError(BADREQUEST, 'Any uId in uIds does not refer to a valid user');
  }

  for (const user of data.users) {
    if (user.authUserId === newCreatorId) {
      dmName.push(user.handleStr);
    }
  }

  dmName.sort();

  const newNameString: string = dmName.toString().split(',').join(', ');

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

async function dmListV1(token: string, authUserId: number) {
  /*
    Description:
      dmListV1 function will return list of dms that the caller is part of.

    Arguments:
      token     string type   -- Input string supplied by user

    Exceptions:
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: return {dms: [{dmId: dmId, name : name}]}
  */

  const data: any = getData();
  const dmsList: object[] = [];

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

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

  if (!(checkToken(token)) ||
      !(dmIdValidator(dmId))) {
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

  if (!(checkToken(token)) ||
      !(dmIdValidator(dmId))) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (checkDmMember(dmId, authUserId)) {
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

  if (!(checkToken(token)) ||
      !(dmIdValidator(dmId))) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const index: number = dm.uIds.indexOf(authUserId);
      if (index > -1) {
        dm.uIds.splice(index, 1);
        return {};
      } else if (dm.creatorId === authUserId) {
        dm.creatorId = -1;
        return {};
      } else {
        return ERROR;
      }
    }
  }
}

function dmMessages(token: string, dmId: number, start: number) {
  /*
    Description:
      dmMessages function will return messages from associated DMs Ids

    Arguments:
      token     string type   -- Input string supplied by user
      dmId      number type   -- Input number supplied by user
      start     number type   -- Input number supplied by user

    Return Value:
      object: return { messages: [messagesData], start: start, end: end}
      object: return {error: 'error'}
  */

  if (!(checkToken(token)) ||
      !(dmIdValidator(dmId)) ||
      start > getDmMessages(dmId).length ||
      start < 0) {
    return ERROR;
  }

  const authUserId: number = tokenToAuthUserId(token).authUserId;

  if (!(checkDmMember(dmId, authUserId))) {
    return ERROR;
  }

  const dmMsgData: object[] = getDmMessages(dmId);
  const returnMsgData: any = [];

  for (let i = 0; i < 50 && (start + i < dmMsgData.length); i++) {
    returnMsgData.push(dmMsgData[start + i]);
  }

  let end = -1;

  if (start + 50 < dmMsgData.length) {
    end = start + 50;
  }

  return {
    messages: [...returnMsgData],
    start: start,
    end: end
  };
}

export {
  dmCreateV1,
  dmListV1,
  dmRemoveV1,
  dmDetailsV1,
  dmLeaveV1,
  dmMessages
};
