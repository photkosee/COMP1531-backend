import validator from 'validator';

function paramTypeChecker(email: string, password: string, nameFirst: string, nameLast: string) {
  /*
    Description:
      Helper function to check typeof parameters entered in authRegisterV1

    Arguments:
      email     string type   -- Input string supplied by function authRegisterV1
      passwrd   string type   -- Input string supplied by function authRegisterV1
      nameFirst string type   -- Input string supplied by function authRegisterV1
      nameLast  string type   -- Input string supplied by function authRegisterV1

    Return Value:
      boolean: true | false
  */

  if (typeof email === 'string' &&
      typeof password === 'string' &&
      typeof nameFirst === 'string' &&
      typeof nameLast === 'string') {
    return true;
  } else {
    return false;
  }
}

function genHandleStr(nameFirst: string, nameLast: string, userData: string[] | any[]) {
  /*
    Description:
      Helper function for generating user handleStr

    Arguments:
      nameFirst string type   -- Input string supplied by function authRegisterV1
      nameLast  string type   -- Input string supplied by function authRegisterV1
      userData  array  type   -- Users array supplied by function authRegisterV1

    Return Value:
      string: newUserHandle
  */

  let newUserHandle: any = `${nameFirst + nameLast}`;

  newUserHandle = newUserHandle.replaceAll(' ', '');

  newUserHandle = newUserHandle.toLowerCase();

  newUserHandle = newUserHandle.replace(/[^a-z0-9]/gi, '');

  newUserHandle = newUserHandle.substring(0, 20);

  const lenHandleStr: number = newUserHandle.length;

  let numToAppend = 0;

  for (let i = 0; i < userData.length; i++) {
    if (userData[i].handleStr === newUserHandle) {
      newUserHandle = `${newUserHandle.substring(0, lenHandleStr) + numToAppend.toString()}`;

      i = 0;
      numToAppend++;
    }
  }
  return newUserHandle;
}

function emailValidator(email: string) {
  /*
    Description:
      Helper function to validate user Email

    Arguments:
      email string type   -- Input string supplied by function authRegisterV1

    Return Value:
      boolean: true | false
  */

  const specialCharacters: Array<string> = ['!', '#', '$', '%', '&', '*', '+', '-', '/', '=', '?', '^', '`', '{', '|', '}', '~'];

  if (validator.isEmail(email)) {
    for (const character of specialCharacters) {
      if (email.includes(character)) {
        return false;
      }
    }
  } else {
    return false;
  }
}

function loginVerifier(email: string, password: string, userData: string[] | any[]) {
  /*
    Description:
      Helper function to validate user Email and password for login

    Arguments:
      email       string type   -- Input string supplied by function authLoginV1
      password    string type   -- Input string supplied by function authLoginV1
      userData    array  type   -- Users array supplied by function authLoginV1

    Return Value:
      object: { token: user.token, authUserId: user.authUserId }
      boolean: false
  */

  for (const user of userData) {
    if (user.email === email &&
        user.password === password &&
        user.isActive === true) {
      return { token: user.token, authUserId: user.authUserId };
    }
  }
  return false;
}

function tryLogout(token: string, userData: string[] | any[]) {
  /*
    Description:
      Helper function to invalidates the token to log the user out

    Arguments:
      token       string type   -- Input string supplied by function authLogoutV1
      userData    array  type   -- Users array supplied by function authLogoutV1

    Return Value:
      boolean: true | false
  */

  for (const user of userData) {
    if (user.token === token &&
        user.isActive === true) {
      return true;
    }
  }
  return false;
}

function genNewSessionId(token: string, userData: string[] | any[]) {
  /*
    Description:
      Helper function to generate newSessionId

    Arguments:
      token       string type   -- Input string supplied by function authRegisterV1
      userData    array  type   -- Users array supplied by function authRegisterV1

    Return Value:
      {}
  */

  for (const user of userData) {
    if (user.token === token &&
        user.isActive === true) {
      const sessionListLength: number = user.sessionList.length;
      const newSessionId = `${user.nameFirst.toLowerCase().replace(/[^a-z]/gi, '') + (sessionListLength + 1).toString()}`;
      user.sessionList.push(newSessionId);
      return {};
    }
  }
}

export {
  paramTypeChecker,
  genHandleStr,
  emailValidator,
  loginVerifier,
  genNewSessionId,
  tryLogout
};
