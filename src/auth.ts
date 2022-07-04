import { getData, setData } from './dataStore';
import {
  paramTypeChecker,
  genHandleStr,
  emailValidator,
  loginVerifier,
  genNewSessionId
} from './authHelperFunctions';

const ERROR = { error: 'error' };

interface newUserDetails {
  token: string,
  authUserId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string,
  handleStr: string,
  permissionId: number,
  sessionList: Array<string>,
  isActive: boolean,
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
      passwrd   string type   -- Input string supplied by user
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
      return ERROR;
    }

    if (!(nameLast.length >= 1 && nameLast.length <= 50)) {
      return ERROR;
    }

    if (emailValidator(email) === false) {
      return ERROR;
    }

    for (const user of data.users) {
      if (user.email === email) {
        return ERROR;
      }
    }

    if (password.length < 6) {
      return ERROR;
    }

    const newHandleStr: string = genHandleStr(nameFirst, nameLast, data.users);

    let newToken = `${(Math.floor(Math.random() * Date.now())).toString()}`;

    newToken = newToken.substring(0, 10);

    const newSessionId = `${nameFirst.toLowerCase().replace(/[^a-z]/gi, '') + '1'}`;

    const newUserDetails: newUserDetails = {
      token: newToken,
      authUserId: newAuthId,
      nameFirst: nameFirst,
      nameLast: nameLast,
      email: email,
      password: password,
      handleStr: newHandleStr,
      permissionId: permissionId,
      sessionList: [newSessionId],
      isActive: true,
    };

    data.users.push(newUserDetails);

    setData(data);

    return { token: newToken, authUserId: newAuthId };
  } else {
    return ERROR;
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

  genNewSessionId(loginDetail.token, data.users);

  return loginDetail;
}

export {
  authRegisterV1,
  authLoginV1
};
