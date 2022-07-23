import { getData } from './dataStore';
import { checkAuthUserId, checkToken } from './channelHelperFunctions';
import { emailValidator } from './authHelperFunctions';
import HTTPError from 'http-errors';
import bcrypt from 'bcryptjs';

const BADREQUEST = 400;
const FORBIDDEN = 403;
const ERROR = { error: 'error' };

export async function userProfileV1(token: string, uId: number) {
/*
  Description:
    userProfileV1 returns information about uId's userId,
    email, first name, last name, and handle

  Arguments:
    token integer string  -- Input integer supplied by header
    uId   integer type    -- Input integer supplied by user

  Exceptions:
  FORBIDDEN   - Invalid Session ID or Token

  Return Value:
    Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
*/

  const data: any = getData();

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!(checkAuthUserId(uId))) {
    throw HTTPError(BADREQUEST, 'User Id is invalid');
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

  return {};
}

export async function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  /*
    Description:
      userProfileSetnameV1 updates user's nameFirst and nameLast

    Arguments:
      token       integer string  -- Input integer supplied by user
      nameFirst   integer string  -- Input integer supplied by user
      nameLast    integer string  -- Input integer supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid name type
      BADREQUEST  - Length of name is not 1-50 characters

    Return Value:
      Object: {} on success
*/

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (typeof (nameFirst) !== 'string' || typeof (nameLast) !== 'string') {
    throw HTTPError(BADREQUEST, 'Invalid name type');
  }

  nameFirst = nameFirst.trim();
  nameLast = nameLast.trim();

  if (nameFirst.length < 1 || nameFirst.length > 50 ||
  nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(BADREQUEST, 'Length of name is not 1-50 characters');
  }

  const data: any = getData();

  nameFirst = nameFirst.trim();
  nameLast = nameLast.trim();

  for (const user of data.users) {
    if (user.sessionList.includes(token)) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  return {};
}

export async function userProfileSetemailV1(token: string, email: string) {
  /*
    Description:
      userProfileSetemailV1 updates user's email

    Arguments:
      token       integer string  -- Input integer supplied by user
      email       integer string  -- Input integer supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid email type
      BADREQUEST  - Email is not valid
      BADREQUEST  - Email is used by another user

    Return Value:
      Object: {} on success
*/

  if (!(await checkToken(token))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (typeof (email) !== 'string') {
    throw HTTPError(BADREQUEST, 'Invalid email type');
  }

  email = email.trim();

  if (emailValidator(email) === false) {
    throw HTTPError(BADREQUEST, 'Email is not valid');
  }

  const data: any = getData();

  for (const user of data.users) {
    for (const sessionId of user.sessionList) {
      const checkSessionId = await bcrypt.compare(sessionId, token);
      if (!checkSessionId) {
        if (email === user.email) {
          throw HTTPError(BADREQUEST, 'Email is used by another user');
        }
      }
    }
  }

  for (const user of data.users) {
    if (user.sessionList.includes(token)) {
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
    if (!(user.sessionList.includes(token))) {
      if (handleStr === user.handleStr) {
        return ERROR;
      }
    }
  }

  for (const user of data.users) {
    if (user.sessionList.includes(token)) {
      user.handleStr = handleStr;
    }
  }
  return {};
}
