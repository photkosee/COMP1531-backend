import { getData } from './dataStore';
import { checkAuthUserId, checkToken } from './channelHelperFunctions';
import { emailValidator } from './authHelperFunctions';

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

  nameFirst = nameFirst.trim();
  nameLast = nameLast.trim();

  if (nameFirst.length < 1 || nameFirst.length > 50 ||
  nameLast.length < 1 || nameLast.length > 50) {
    return ERROR;
  }

  const data: any = getData();

  nameFirst = nameFirst.trim();
  nameLast = nameLast.trim();

  for (const user of data.users) {
    if (token === user.token) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  return {};
}

export function userProfileSetemailV1(token: string, email: string) {
  /*
    Description:
      userProfileSetemailV1 updates user's email

    Arguments:
      token       integer string  -- Input integer supplied by user
      email       integer string  -- Input integer supplied by user

    Return Value:
      Object: {} on success
      object: {error: 'error'} on error
*/

  if (!checkToken(token)) {
    return ERROR;
  }

  if (typeof (email) !== 'string') {
    return ERROR;
  }

  email = email.trim();

  if (emailValidator(email) === false) {
    return ERROR;
  }

  const data: any = getData();

  for (const user of data.users) {
    if (token !== user.token) {
      if (email === user.email) {
        return ERROR;
      }
    }
  }

  for (const user of data.users) {
    if (token === user.token) {
      user.email = email;
    }
  }
  return {};
}

export function userProfileSethandleV1(token: string, handleStr: string) {
  /*
    Description:
      userProfileSethandleV1 updates user's handleStr

    Arguments:
      token       integer string  -- Input integer supplied by user
      handleStr   integer string  -- Input integer supplied by user

    Return Value:
      Object: {} on success
      object: {error: 'error'} on error
*/
  if (!checkToken(token) || typeof (handleStr) !== 'string') {
    return ERROR;
  }

  handleStr = handleStr.trim();

  if (handleStr.length < 3 || handleStr.length > 20) {
    return ERROR;
  }
  if (!(/^[a-zA-Z0-9]+$/.test(handleStr))) {
    return ERROR;
  }

  const data: any = getData();

  for (const user of data.users) {
    if (token !== user.token) {
      if (handleStr === user.handleStr) {
        return ERROR;
      }
    }
  }

  for (const user of data.users) {
    if (token === user.token) {
      user.handleStr = handleStr;
    }
  }

  return {};
}
