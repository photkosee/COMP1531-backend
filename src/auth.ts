import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import config from './config.json';
import {
  paramTypeChecker,
  genHandleStr,
  emailValidator,
  loginVerifier,
  tryLogout,
  generateJwtToken,
  hashPassword,
  sendEmail
} from './authHelperFunctions';

const HOST: string = process.env.IP || 'localhost';
const url = config.url;
const PORT: number = parseInt(process.env.PORT || config.port);

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
  sessionList: Array<string>
}

interface loginDetail {
  token: string,
  authUserId: number,
}

async function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
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

    const passwordHash = await hashPassword(password);

    const defaultProfileImgUrl = `${(HOST === 'localhost') ? `${url}:` : `https://${HOST}:`}${PORT}/static/profile.jpg`;

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
      sessionList: [newSessionId]
    };

    data.users.push(newUserDetails);
    setData(data);

    const newToken = await generateJwtToken(newAuthId, newSessionId);

    return { token: newToken, authUserId: newAuthId };
  } else {
    throw HTTPError(BADREQUEST, 'Received invalid data type');
  }
}

async function authLoginV1(email: string, password: string) {
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

  const loginDetail: loginDetail = await loginVerifier(email, password, data.users);

  setData(data);

  return loginDetail;
}

async function authLogoutV1(token: string, authUserId: number) {
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
  const logoutDetail = await tryLogout(token, authUserId, data.users);

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

async function authPasswordResetV1(resetCode: string, newPassword: string) {
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
      if (data.passwordReset[index].email === user.email) {
        data.passwordReset.splice(index, 1);
        user.password = await hashPassword(newPassword);
        setData(data);
        return {};
      }
    }
  }

  throw HTTPError(BADREQUEST, 'Invalid reset code');
}

export {
  authRegisterV1,
  authLoginV1,
  authLogoutV1,
  authPasswordResetRequestV1,
  authPasswordResetV1
};
