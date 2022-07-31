import sgMail from '@sendgrid/mail';
import HTTPError from 'http-errors';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
    if (userData[i].handleStr === newUserHandle && userData[i].isActive === true) {
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

async function loginVerifier(email: string, password: string, userData: string[] | any[]) {
  /*
    Description:
      Helper function to validate user Email and password for login

    Arguments:
      email       string type   -- Input string supplied by function authLoginV1
      password    string type   -- Input string supplied by function authLoginV1
      userData    array  type   -- Users array supplied by function authLoginV1

    Exceptions:
      BADREQUEST - Occurs when email entered does not belong to a user.
      BADREQUEST - Occurs when password is not correct.

    Return Value:
      object: { token: user.token, authUserId: user.authUserId }
  */

  for (const user of userData) {
    if (user.email === email && user.isActive) {
      if (await bcrypt.compare(password, user.password)) {
        let newSessionId = `${(Math.floor(Math.random() * Date.now())).toString()}`;
        newSessionId = newSessionId.substring(0, 10);

        user.sessionList.push(newSessionId);

        const newToken = await generateJwtToken(user.authUserId, newSessionId);

        return { token: newToken, authUserId: user.authUserId };
      } else {
        throw HTTPError(400, 'Invalid Password');
      }
    }
  }
  throw HTTPError(400, 'Invalid Email');
}

async function tryLogout(token: string, authUserId:number, userData: string[] | any[]) {
  /*
    Description:
      Helper function to invalidate the sessionId to log the user out

    Arguments:
      token       string type   -- Input string supplied by function authLogoutV1
      userData    array  type   -- Users array supplied by function authLogoutV1
      authUserId  string type   -- Input string supplied by function authLogoutV1

    Return Value:
      boolean: true | false
  */

  for (const user of userData) {
    if (user.authUserId === authUserId) {
      for (const sessionId of user.sessionList) {
        if (await bcrypt.compare(sessionId, token)) {
          const index: number = user.sessionList.indexOf(sessionId);
          user.sessionList.splice(index, 1);
          return true;
        }
      }
    }
  }
  return false;
}

async function hashPassword(password: string) {
  /*
    Description:
      hashPassword Helper function to hash user Password

    Arguments:
      password  string type   -- Input string supplied by authRegisterV1

    Return Value:
      string: hashPassword
  */
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash.toString();
}

async function generateJwtToken(authUserId: number, newSessionId: string) {
  /*
    Description:
      generateJwtToken Helper function to generate JWT Token

    Arguments:
      authUserId    number type   -- Input string supplied by authRegisterV1
      newSessionId  string type   -- Input string supplied by authRegisterV1

    Return Value:
      string: token
  */
  const salt = await bcrypt.genSalt();
  const sessionHash = await bcrypt.hash(newSessionId, salt);

  const payload = { id: authUserId, salt: sessionHash };
  return jwt.sign(payload, '4ee66c5740fece1be9fdc0e269dd77ef7ea99874ee617bcfb2dae2c429f18acb');
}

async function sendEmail(email: string, name: string, resetCode: string) {
  /*
    Description:
      sendEmail Helper function to send password reset code to user

    Arguments:
      email       string type   -- string supplied by authPasswordResetRequestV1
      name        string type   -- string supplied by authPasswordResetRequestV1
      resetCode   string type   -- string supplied by authPasswordResetRequestV1

  */

  sgMail.setApiKey('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');

  const message = {
    to: {
      name: name,
      email: email,
    },
    from: {
      name: 'UNSW Treats',
      email: 'f09acrunchie@gmail.com',
    },
    templateId: 'd-00b56886e66142da94579df5803180e3',
    dynamicTemplateData: {
      name: name,
      code: resetCode,
    }
  };

  await sgMail.send(message);
}

export {
  paramTypeChecker,
  genHandleStr,
  emailValidator,
  loginVerifier,
  tryLogout,
  hashPassword,
  generateJwtToken,
  sendEmail
};
