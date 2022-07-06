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

beforeAll(() => {
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

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Tests for successful logout - auth/logout/v1', () => {
  for (let i = 0; i < registeredUser.length; i++) {
    const res = request('POST', `${url}:${port}/auth/logout/v1`, {
      json: {
        token: registrationData[i].token,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  }
});

describe('Testing with invalid token passed - auth/logout/v1', () => {
  test.each([
    {
      token: `${(Math.floor(Math.random() * Date.now())).toString().substring(0, 10)}`,
      expected: ERROR,
    },
    {
      token: `${(Math.floor(Math.random() * Date.now())).toString().substring(0, 10)}`,
      expected: ERROR,
    },
    {
      token: `${(Math.floor(Math.random() * Date.now())).toString().substring(0, 10)}`,
      expected: ERROR,
    },
  ])(
    '($token) => $expected',
    ({ token, expected }) => {
      const res = request('POST', `${url}:${port}/auth/logout/v1`, {
        json: {
          token: token,
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});
