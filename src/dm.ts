import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { checkToken } from './channelHelperFunctions';
import {
  incrementDmsJoined,
  decreaseDmsJoined,
  incrementDmsExist,
  decreaseDmsExist,
  decreaseMessagesExist
} from './userHelperFunctions';
import { dmIdValidator, checkDmMember, getDmMessages } from './dmHelperFunctions';

const BADREQUEST = 400;
const FORBIDDEN = 403;

async function dmCreateV1(token: string, authUserId: number, uIds: number[]) {
  /*
    Description:
      dmCreateV1 function will create a dm with members: supplied uIds
      and creator to be the caller.

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      number type   -- number supplied by request header
      uIds            array type    -- Input array supplied by user

    Exceptions:
      BADREQUEST - Occurs when any uId in uIds does not refer to a valid user.
      BADREQUEST - Occurs when there are duplicate 'uId's in uIds.
      BADREQUEST - Occurs when received invalid data type.
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: {dmId: dmId}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

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
  let ownerHandleStr = '';
  for (const user of data.users) {
    if (user.authUserId === newCreatorId) {
      ownerHandleStr = user.handleStr;
      dmName.push(user.handleStr);
    }
  }

  dmName.sort();

  const newNameString: string = dmName.toString().split(',').join(', ');
  for (const id of uIds) {
    for (const user of data.users) {
      if (id === user.authUserId) {
        user.notifications.unshift({
          channelId: -1,
          dmId: newDmId,
          notificationMessage: `${ownerHandleStr} added you to ${newNameString}`
        });
      }
    }
  }
  data.dms.push({
    dmId: newDmId,
    name: newNameString,
    uIds: [...uIds],
    creatorId: newCreatorId,
    messages: []
  });

  incrementDmsJoined(authUserId);

  for (const user of uIds) {
    incrementDmsJoined(user);
  }

  incrementDmsExist();

  setData(data);
  return { dmId: newDmId };
}

async function dmListV1(token: string, authUserId: number) {
  /*
    Description:
      dmListV1 function will return list of dms that the caller is part of.

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      number type   -- number supplied by request header

    Exceptions:
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: {dms: [{dmId: dmId, name : name}]}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  const dmsList: object[] = [];

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

async function dmRemoveV1(token: string, authUserId: number, dmId: number) {
  /*
    Description:
      dmRemoveV1 function will remove an existing DM, so all members are no longer in the DM,
      original creator of the DM can only remove dms.

    Arguments:
      token         string type   -- string supplied by request header
      authUserId    number type   -- number supplied by request header
      dmId          number type   -- Input number supplied by user

    Exceptions:
      BADREQUEST - Occurs when dmId does not refer to a valid DM.
      FORBIDDEN  - Occurs when dmId is valid and the authorised user is not the original DM creator.
      FORBIDDEN  - Occurs when dmId is valid and the authorised user is no longer in the DM.
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: {}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (!(dmIdValidator(dmId))) {
    throw HTTPError(BADREQUEST, 'dmId does not refer to a valid DM');
  }

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.creatorId === authUserId) {
        const dmIndex = data.dms.indexOf(dm);
        data.dms.splice(dmIndex, 1);

        decreaseDmsJoined(authUserId);
        for (const userId of dm.uIds) {
          decreaseDmsJoined(userId);
        }
        // eslint-disable-next-line no-unused-vars
        for (const message of dm.messages) {
          decreaseMessagesExist();
        }
        decreaseDmsExist();

        return {};
      } else {
        throw HTTPError(FORBIDDEN, 'Authorised user is not the original DM creator');
      }
    }
  }
}

async function dmDetailsV1(token: string, authUserId: number, dmId: number) {
  /*
    Description:
      dmDetailsV1 function will provide basic details about the DM.

    Arguments:
      token       string type   -- Input string supplied by request header
      authUserId  number type   -- number supplied by request header
      dmId        number type   -- Input number supplied by user

    Exceptions:
      BADREQUEST - Occurs when dmId does not refer to a valid DM.
      FORBIDDEN  - Occurs when Authorised user is not a member of the DM.
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: { name: name, members: [user] }
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (!(dmIdValidator(dmId))) {
    throw HTTPError(BADREQUEST, 'dmId does not refer to a valid DM');
  }

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
        throw HTTPError(FORBIDDEN, 'Authorised user is not a member of the DM');
      }
    }
  }
}

async function dmLeaveV1(token: string, authUserId: number, dmId: number) {
  /*
    Description:
      dmLeaveV1 function will remove the user as a member of the DM.

    Arguments:
      token       string type   -- Input string supplied by request header
      authUserId  number type   -- number supplied by request header
      dmId        number type   -- Input number supplied by user

    Exceptions:
      BADREQUEST - Occurs when dmId does not refer to a valid DM.
      FORBIDDEN  - Occurs when Authorised user is not a member of the DM.
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: {}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (!(dmIdValidator(dmId))) {
    throw HTTPError(BADREQUEST, 'dmId does not refer to a valid DM');
  }

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const index: number = dm.uIds.indexOf(authUserId);
      if (index > -1) {
        dm.uIds.splice(index, 1);
        decreaseDmsJoined(authUserId);
        return {};
      } else if (dm.creatorId === authUserId) {
        dm.creatorId = -1;
        decreaseDmsJoined(authUserId);
        return {};
      } else {
        throw HTTPError(FORBIDDEN, 'Authorised user is not a member of the DM');
      }
    }
  }
}

async function dmMessages(token: string, authUserId: number, dmId: number, start: number) {
  /*
    Description:
      dmMessages function will return messages from associated DMs Ids

    Arguments:
      token       string type   -- Input string supplied by request header
      authUserId  number type   -- number supplied by request header
      dmId        number type   -- Input number supplied by user
      start       number type   -- Input number supplied by user

    Exceptions:
      BADREQUEST - Occurs when dmId does not refer to a valid DM.
      BADREQUEST - Occurs when start is greater than the total number of messages in the channel.
      FORBIDDEN  - Occurs when Authorised user is not a member of the DM.
      FORBIDDEN  - Occurs when sessionId/token is not found in database.

    Return Value:
      object: { messages: [messagesData], start: start, end: end}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!(dmIdValidator(dmId))) {
    throw HTTPError(BADREQUEST, 'dmId does not refer to a valid DM');
  }

  if (start > getDmMessages(dmId).length ||
      start < 0) {
    throw HTTPError(BADREQUEST, 'Start is greater than the total number of messages in the channel');
  }

  if (!(checkDmMember(dmId, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Authorised user is not a member of the DM');
  }

  const dmMsgData: any[] = getDmMessages(dmId);
  const returnMsgData: any = [];

  for (let i = 0; i < 50 && (start + i < dmMsgData.length); i++) {
    let checkAuthUserReact = false;
    for (const id of dmMsgData[start + i].reacts[0].uIds) {
      if (id === authUserId) {
        checkAuthUserReact = true;
      }
    }
    dmMsgData[start + i].reacts[0].isThisUserReacted = checkAuthUserReact;
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
