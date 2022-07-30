import { getData } from './dataStore';
import { checkToken, checkAuthUserIdProfile, checkTokenProfile } from './channelHelperFunctions';
import { emailValidator } from './authHelperFunctions';
import HTTPError from 'http-errors';

const BADREQUEST = 400;
const FORBIDDEN = 403;

async function userProfileV1(token: string, authUserId: number, uId: number) {
/*
  Description:
    userProfileV1 returns information about uId's userId,
    email, first name, last name, and handle

  Arguments:
    token       string type -- string supplied by header
    authUserId  number type -- number supplied by header
    uId         number type -- Input number supplied by user

  Exceptions:
    FORBIDDEN   - Invalid Session ID or Token

  Return Value:
    Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
*/

  if (!(await checkTokenProfile(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (!(checkAuthUserIdProfile(uId))) {
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
          handleStr: user.handleStr,
          profileImgUrl: user.profileImgUrl
        }
      };
    }
  }
}

async function userProfileSetnameV1(token: string, authUserId: number, nameFirst: string, nameLast: string) {
  /*
    Description:
      userProfileSetnameV1 updates user's nameFirst and nameLast

    Arguments:
      token         string type -- string supplied by header
      authUserId    number type -- number supplied by header
      nameFirst     string type -- Input integer supplied by user
      nameLast      string type -- Input integer supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid name type
      BADREQUEST  - Length of name is not 1-50 characters

    Return Value:
      Object: {} on success
*/

  if (!(await checkToken(token, authUserId))) {
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
    if (user.authUserId === authUserId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  return {};
}

async function userProfileSetemailV1(token: string, authUserId: number, email: string) {
  /*
    Description:
      userProfileSetemailV1 updates user's email

    Arguments:
      token       string type  -- string supplied by header
      authUserId  number type  -- number supplied by header
      email       string type  -- Input string supplied by user

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid email type
      BADREQUEST  - Email is not valid
      BADREQUEST  - Email is used by another user

    Return Value:
      Object: {} on success
*/

  if (!(await checkToken(token, authUserId))) {
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
    if (user.isActive === true) {
      if (user.email === email && user.authUserId !== authUserId) {
        throw HTTPError(BADREQUEST, 'Email is used by another user');
      }
    }
  }

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      user.email = email;
    }
  }

  return {};
}

async function userProfileSethandleV1(token: string, authUserId: number, handleStr: string) {
/*
  Description:
    userProfileSethandleV1 updates user's handleStr

  Arguments:
    token       string type  -- string supplied by header
    authUserId  number type  -- number supplied by header
    handleStr   string type  -- Input string supplied by user

  Exceptions:
    FORBIDDEN   - Invalid Session ID or Token
    BADREQUEST  - Invalid handleStr type
    BADREQUEST  - handleStr must be 3-20 characters
    BADREQUEST  - handleStr must only be alphanumeric

  Return Value:
    Object: {} on success
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (typeof (handleStr) !== 'string') {
    throw HTTPError(BADREQUEST, 'Invalid handleStr type');
  }

  handleStr = handleStr.trim();

  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(BADREQUEST, 'handleStr must be 3-20 characters');
  }

  if (!(/^[a-zA-Z0-9]+$/.test(handleStr))) {
    throw HTTPError(BADREQUEST, 'handleStr must only be alphanumeric');
  }

  const data: any = getData();

  for (const user of data.users) {
    if (user.isActive === true) {
      if (user.handleStr === handleStr && user.authUserId !== authUserId) {
        throw HTTPError(BADREQUEST, 'handleStr is used by another user');
      }
    }
  }

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      user.handleStr = handleStr;
    }
  }

  return {};
}

async function userStatsV1(token: string, authUserId: number) {
/*
  Description:
    userStatsV1 fetches stats about user's use of UNSW treats

  Arguments:
    token       string type  -- string supplied by header
    authUserId  number type  -- number supplied by header

  Exceptions:
    FORBIDDEN   - Invalid Session ID or Token

  Return Value:
    Object: {} on success
*/

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  


}

export {
  userProfileV1,
  userProfileSetnameV1,
  userProfileSethandleV1,
  userProfileSetemailV1,
  userStatsV1
};
