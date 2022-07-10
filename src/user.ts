import { getData } from './dataStore';
import { checkAuthUserId, checkToken } from './channelHelperFunctions';

const ERROR = { error: 'error' };

export function userProfileV1(token: string, uId: number) {
/*
  Description:
    userProfileV1 returns information about uId's userId,
    email, first name, last name, and handle

  Arguments:
    token integer string  -- Input integer supplied by user
    uId   integer type    -- Input integer supplied by user

  Return Value:
    Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
    object: {error: 'error'}
*/

  const data: any = getData();

  if (!(checkToken(token)) || !(checkAuthUserId(uId))) {
    return ERROR;
  }

  for (const user of data.users) {
    if (user.authUserId === uId) {
      return {
        user: {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        }
      };
    }
  }

  return ERROR;
}

export function userProfileSetnameV1(token: string, nameFirst: string,
  nameLast: string) {
  /*
    Description:
      userProfileSetnameV1 updates user's nameFirst and nameLast

    Arguments:
      token       integer string  -- Input integer supplied by user
      nameFirst   integer string  -- Input integer supplied by user
      nameLast    integer string  -- Input integer supplied by user

    Return Value:
      Object: {} on success
      object: {error: 'error'} on error
*/

  if (!checkToken(token) ||
  typeof (nameFirst) !== 'string' ||
  typeof (nameLast) !== 'string') {
    return ERROR;
  }

  if (nameFirst.length <= 1 || nameFirst.length >= 50 ||
  nameLast.length <= 1 || nameLast.length >= 50) {
    return ERROR;
  }

  const data: any = getData();

  const updatedNameFirst = nameFirst.trim();
  const updatedNameLast = nameLast.trim();

  for (const user of data.users) {
    if (token === user.token) {
      user.nameFirst = updatedNameFirst;
      user.nameLast = updatedNameLast;
    }
  }

  return {};
}
