import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import config from './config.json';
import env from './env.json';
import {
  generateJwtToken,
  paramTypeChecker,
  emailValidator,
  loginVerifier,
  genHandleStr,
  tryLogout,
  sendEmail,
  getHashOf
} from './authHelperFunctions';
import {
  createUserStats,
  createWorkspaceStats
} from './userHelperFunctions';

const deployedUrl: string = env.deployedUrl;
const port = config.port;
const url = config.url;

const BADREQUEST = 400;
const FORBIDDEN = 403;

interface newUserDetails {
  authUserId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string,
  handleStr: string,
  profileImgUrl: string,
  permissionId: number,
  isActive: boolean,
  sessionList: Array<string>,
  notifications: Array<any>
  userStats: object
}

interface loginDetail {
  token: string,
  authUserId: number,
}

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  /*
    Description:
      authRegisterV1 function will register new users with
      their details in dataStore.js

    Arguments:
      email     string type   -- Input string supplied by user
      password  string type   -- Input string supplied by user
      nameFirst string type   -- Input string supplied by user
      nameLast  string type   -- Input string supplied by user

    Exceptions:
      BADREQUEST - Occurs when any of the fields is empty string.
      BADREQUEST - Occurs when email format is wrong.
      BADREQUEST - Occurs when length of password or nameFirst or nameLast is not valid.
      BADREQUEST - Occurs when user is already registered.

    Return Value:
      object: {token: token, authUserId: authUserId}
  */

  const data: any = getData();

  if (data.users.length === 0) {
    createWorkspaceStats();
  }

  const checkParamType: boolean = paramTypeChecker(email, password, nameFirst, nameLast);

  if (checkParamType) {
    email = email.trim();
    password = password.trim();
    nameFirst = nameFirst.trim();
    nameLast = nameLast.trim();
    const newAuthId: number = (data.users.length) + 1;

    const permissionId: number = (newAuthId === 1) ? 1 : 2;

    if (!(nameFirst.length >= 1 && nameFirst.length <= 50)) {
      throw HTTPError(BADREQUEST, 'Invalid first name length');
    }

    if (!(nameLast.length >= 1 && nameLast.length <= 50)) {
      throw HTTPError(BADREQUEST, 'Invalid last name length');
    }

    if (emailValidator(email) === false) {
      throw HTTPError(BADREQUEST, 'Invalid email');
    }

    for (const user of data.users) {
      if (user.email === email && user.isActive === true) {
        throw HTTPError(BADREQUEST, 'Email already in use');
      }
    }

    if (password.length < 6) {
      throw HTTPError(BADREQUEST, 'Invalid password length');
    }

    const newHandleStr: string = genHandleStr(nameFirst, nameLast, data.users);

    let newSessionId = `${(Math.floor(Math.random() * Date.now())).toString()}`;
    newSessionId = newSessionId.substring(0, 10);

    const passwordHash = getHashOf(password + env.secret);

    const defaultProfileImgUrl = `${process.env.PORT ? deployedUrl : `${url}:${port}`}/static/profile.jpg`;

    const userStats: object = createUserStats();

    const newUserDetails: newUserDetails = {
      authUserId: newAuthId,
      nameFirst: nameFirst,
      nameLast: nameLast,
      email: email,
      password: passwordHash,
      handleStr: newHandleStr,
      profileImgUrl: defaultProfileImgUrl,
      permissionId: permissionId,
      isActive: true,
      sessionList: [newSessionId],
      notifications: [],
      userStats: userStats
    };

    data.users.push(newUserDetails);
    setData(data);

    const newToken = generateJwtToken(newAuthId, newSessionId);

    return { token: newToken, authUserId: newAuthId };
  } else {
    throw HTTPError(BADREQUEST, 'Received invalid data type');
  }
}

function authLoginV1(email: string, password: string) {
  /*
    Description:
      authLoginV1 function will help user to login if the user
      enters correct email and password combination

    Arguments:
      email     string type   -- Input string supplied by user
      passwrd   string type   -- Input string supplied by user

    Exceptions:
      BADREQUEST - Occurs when email entered does not belong to a user.
      BADREQUEST - Occurs when password is not correct.

    Return Value:
      object: {token: token, authUserId: authUserId}
  */

  email = email.trim();

  const data: any = getData();

  const loginDetail: loginDetail = loginVerifier(email, password, data.users);

  setData(data);

  return loginDetail;
}

function authLogoutV1(token: string, authUserId: number) {
  /*
    Description:
      authLogoutV1 function invalidates the token to log the user out

    Arguments:
      token       string type   -- string supplied by request header
      authUserId  string type   -- string supplied by request header

    Exceptions:
      FORBIDDEN - Occurs when sessionId/token is not found in database.

    Return Value:
      object: return {} if logout is successful
  */

  const data: any = getData();
  const logoutDetail = tryLogout(token, authUserId, data.users);

  if (!(logoutDetail)) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }
  setData(data);
  return {};
}

async function authPasswordResetRequestV1(email: string) {
  /*
    Description:
      authPasswordResetRequestV1 function helps the user to request for a password reset

    Arguments:
      email     string type   -- Input string supplied by user

    Return Value:
      object: return {}
  */

  email = email.trim();
  const data: any = getData();

  for (const user of data.users) {
    if (user.email === email) {
      const newResetCode = `${Math.floor(100000 + Math.random() * 900000)}`;
      const resetObj = {
        email: email,
        resetCode: newResetCode
      };
      data.passwordReset.push(resetObj);
      user.sessionList = [];
      setData(data);
      await sendEmail(email, user.nameFirst, newResetCode);
    }
  }
  return {};
}

function authPasswordResetV1(resetCode: string, newPassword: string) {
  /*
    Description:
      authPasswordResetV1 function helps the user reset their password

    Arguments:
      resetCode     string type   -- Input string supplied by user
      newPassword   string type   -- Input string supplied by user

    Return Value:
      object: {}
  */

  if (newPassword.length < 6) {
    throw HTTPError(BADREQUEST, 'Invalid password length');
  }

  const data: any = getData();

  const index: number = data.passwordReset.findIndex((object: { resetCode: string; }) => object.resetCode === resetCode);

  if (index !== -1) {
    for (const user of data.users) {
      if (user.email === data.passwordReset[index].email) {
        data.passwordReset.splice(index, 1);
        user.password = getHashOf(newPassword + env.secret);
        setData(data);
        return {};
      }
    }
  }

  throw HTTPError(BADREQUEST, 'Invalid reset code');
}

function googleLoginV1(email: string, nameFirst: string, nameLast: string, profileImgUrl: string) {
  const data: any = getData();

  if (data.users.length === 0) {
    createWorkspaceStats();
  }

  const newAuthId: number = (data.users.length) + 1;

  const permissionId: number = (newAuthId === 1) ? 1 : 2;

  for (const user of data.users) {
    if (user.email === email && user.isActive) {
      let newSessionId = `${(Math.floor(Math.random() * Date.now())).toString()}`;
      newSessionId = newSessionId.substring(0, 10);

      user.sessionList.push(newSessionId);

      const newToken = generateJwtToken(user.authUserId, newSessionId);

      return { token: newToken, authUserId: user.authUserId };
    }
  }

  const newHandleStr: string = genHandleStr(nameFirst, nameLast, data.users);

  let newSessionId = `${(Math.floor(Math.random() * Date.now())).toString()}`;
  newSessionId = newSessionId.substring(0, 10);

  const userStats: object = createUserStats();

  const newUserDetails: newUserDetails = {
    authUserId: newAuthId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: getHashOf('User LoggedIn through google oAuth token' + env.secret),
    handleStr: newHandleStr,
    profileImgUrl: profileImgUrl,
    permissionId: permissionId,
    isActive: true,
    sessionList: [newSessionId],
    notifications: [],
    userStats: userStats
  };

  data.users.push(newUserDetails);
  setData(data);

  const newToken = generateJwtToken(newAuthId, newSessionId);

  return { token: newToken, authUserId: newAuthId };
}

export {
  authPasswordResetRequestV1,
  authPasswordResetV1,
  authRegisterV1,
  googleLoginV1,
  authLogoutV1,
  authLoginV1
};
