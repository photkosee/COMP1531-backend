import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mjghridul', nameLast: 'Anand' },
  { email: 'mrihhduls@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Mridul', nameLast: 'Singh' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mriuffhdul', nameLast: 'Rathor' },
];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];

  for (const user of registeredUser) {
    const res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const bodyObj = JSON.parse(res.body as string);

    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }
});

test('Tests for login successful - auth/login/v2', () => {
  for (let i = 0; i < registeredUser.length; i++) {
    const res = request('POST', `${url}:${port}/auth/login/v2`, {
      json: {
        email: registeredUser[i].email,
        password: registeredUser[i].password,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(registrationData[i]);
  }
});

const invalidPassData: any = [
  { email: 'mridul@gmail.com', password: 'uhunr5 67T#$%' },
  { email: 'mrihhduls@gmail.com', password: ' uhunr56ef7T#$%' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnr567T#$% ' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnskfgr567T#$%' },
];

test('Testing with invalid password but valid email - auth/login/v2', () => {
  for (let i = 0; i < invalidPassData.length; i++) {
    const res = request('POST', `${url}:${port}/auth/login/v2`, {
      json: {
        email: invalidPassData[i].email,
        password: invalidPassData[i].password,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

const invalidEmailData: any = [
  { email: '', password: 'uhunr567T#$%' },
  { email: '    ', password: 'uhunr56ef7T#$%' },
  { email: 'mrjgiduljbh907@gmail.com', password: 'uhudfnr567T#$%' },
  { email: 'mridul @gmail.com', password: 'uhunr567T#$%' },
  { email: 'mrihhduls@mail.com', password: 'uhunr56ef7T#$%' },
];

test('Testing with email that does not belong to a existing user - auth/login/v2', () => {
  for (let i = 0; i < invalidEmailData.length; i++) {
    const res = request('POST', `${url}:${port}/auth/login/v2`, {
      json: {
        email: invalidEmailData[i].email,
        password: invalidEmailData[i].password,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});
