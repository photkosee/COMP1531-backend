import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

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
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
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

    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@email.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const userId2 = user2.authUserId;

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: userId2
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[0].token
      }
    });
    // ======================== SET UP END ===========================

    for (const user of userData) {
      const res = request('GET', `${url}:${port}/users/all/v2`, {
        headers: {
          'Content-type': 'application/json',
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
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'global@email.com',
        password: '1234567',
        nameFirst: 'global',
        nameLast: 'Last'
      }
    });
    // ======================== SET UP START ===========================

    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0';

    res = request('GET', `${url}:${port}/users/all/v2`, {
      headers: {
        'Content-type': 'application/json',
        token: dummyToken
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Incorrect type for token', () => {
    const tokenObj: any = { token: 123 };

    const res = request('GET', `${url}:${port}/users/all/v2`, {
      headers: {
        'Content-type': 'application/json',
        token: tokenObj.token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
