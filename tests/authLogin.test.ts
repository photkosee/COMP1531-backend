import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const port = config.port;
const url = config.url;

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mjghridul', nameLast: 'Anand' },
  { email: 'mrihhduls@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Mridul', nameLast: 'Singh' }
];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  for (const user of registeredUser) {
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Tests for login successful - auth/login/v3', () => {
  for (let i = 0; i < registeredUser.length; i++) {
    const res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: registeredUser[i].email,
        password: registeredUser[i].password
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    expect(res.statusCode).toBe(OK);
  }
});

const invalidPassData: any = [
  { email: 'mridul@gmail.com', password: 'uhunr5 67T#$%' },
  { email: 'mrihhduls@gmail.com', password: ' uhunr56ef7T#$%' }
];

test('Testing with invalid password but valid email - auth/login/v3', () => {
  for (let i = 0; i < invalidPassData.length; i++) {
    const res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: invalidPassData[i].email,
        password: invalidPassData[i].password
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  }
});

const invalidEmailData: any = [
  { email: '    ', password: 'uhunr56ef7T#$%' },
  { email: 'mrjgiduljbh907@gmail.com', password: 'uhudfnr567T#$%' },
  { email: 'mridul @gmail.com', password: 'uhunr567T#$%' }
];

test('Testing with email that does not belong to a existing user - auth/login/v3', () => {
  for (let i = 0; i < invalidEmailData.length; i++) {
    const res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: invalidEmailData[i].email,
        password: invalidEmailData[i].password
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  }
});
