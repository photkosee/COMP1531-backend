import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

interface authRegisterObj {
  token: string,
  authUserId: number
}

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid returns', () => {
  test('Return list of users', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const expectedData: any = [];

    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user1@email.com', password: '1234567', nameFirst: 'user1', nameLast: 'Last' },
      { email: 'user2@email.com', password: '1234567', nameFirst: 'user2', nameLast: 'Last' }
    ];

    for (const users of userInput) {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: users.email,
          password: users.password,
          nameFirst: users.nameFirst,
          nameLast: users.nameLast
        }
      });
      const user: authRegisterObj = JSON.parse(res.getBody() as string);
      userData.push({ token: user.token, authUserId: user.authUserId });
      expectedData.push({
        uId: user.authUserId,
        email: users.email,
        nameFirst: users.nameFirst,
        nameLast: users.nameLast,
        handleStr: expect.any(String)
      });
    }
    // ======================== SET UP START ===========================

    for (const user of userData) {
      const res = request('GET', `${url}:${port}/users/all/v1`, {
        qs: {
          token: user.token
        }
      });
      const data = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({ users: expectedData });
    }
  });
});

describe('Error returns', () => {
  test('Non-existent token', () => {
    // ======================== SET UP START ===========================
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'global@email.com',
        password: '1234567',
        nameFirst: 'global',
        nameLast: 'Last'
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token = user.token;
    // ======================== SET UP START ===========================

    const dummyToken = token + 'abc';
    res = request('GET', `${url}:${port}/users/all/v1`, {
      qs: {
        token: dummyToken
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Incorrect type for token', () => {
    const res = request('GET', `${url}:${port}/users/all/v1`, {
      qs: {
        token: 123
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});
