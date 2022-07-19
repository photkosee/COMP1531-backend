import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import bcrypt from 'bcryptjs';
import {
  paramTypeChecker,
  genHandleStr,
  emailValidator,
  loginVerifier,
  tryLogout,
  generateJwtToken
} from './authHelperFunctions';

const ERROR = { error: 'error' };

interface newUserDetails {
  authUserId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string,
  handleStr: string,
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

    Return Value:
      object: {token: token, authUserId: authUserId} will return users authId
      object: return {error: 'error'}
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
      throw HTTPError(400, 'Invalid first name length');
    }

    if (!(nameLast.length >= 1 && nameLast.length <= 50)) {
      throw HTTPError(400, 'Invalid last name length');
    }

    if (emailValidator(email) === false) {
      throw HTTPError(400, 'Invalid email');
    }

    for (const user of data.users) {
      if (user.email === email) {
        throw HTTPError(400, 'Email already in use');
      }
    }

    if (password.length < 6) {
      throw HTTPError(400, 'Invalid password length');
    }

    const newHandleStr: string = genHandleStr(nameFirst, nameLast, data.users);

    let newSessionId = `${(Math.floor(Math.random() * Date.now())).toString()}`;
    newSessionId = newSessionId.substring(0, 10);

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUserDetails: newUserDetails = {
      authUserId: newAuthId,
      nameFirst: nameFirst,
      nameLast: nameLast,
      email: email,
      password: passwordHash,
      handleStr: newHandleStr,
      permissionId: permissionId,
      isActive: true,
      sessionList: [newSessionId]
    };

    data.users.push(newUserDetails);

    setData(data);

    const newToken = await generateJwtToken(newAuthId, newSessionId);
    return { token: newToken, authUserId: newAuthId };
  } else {
    throw HTTPError(400, 'Received invalid data type');
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

    Return Value:
      object: {token: token, authUserId: authUserId} will return users authId
      object: return {error: 'error'}
  */

  email = email.trim();

  const data: any = getData();

  const loginDetail: loginDetail | boolean = loginVerifier(email, password, data.users);

  if (loginDetail === false) {
    return ERROR;
  }
  return loginDetail;
}

function authLogoutV1(token: string) {
  /*
    Description:
      authLogoutV1 function invalidates the token to log the user out

    Arguments:
      token     string type   -- token string supplied by browser

    Return Value:
      object: return {} if logout is successful
      object: return {error: 'error'} if token is invalid
  */

  const data: any = getData();
  const logoutDetail = tryLogout(token, data.users);

  if (!(logoutDetail)) {
    return ERROR;
  }
  return {};
}

export {
  authRegisterV1,
  authLoginV1,
  authLogoutV1
};
