import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid returns', () => {
  test('Return list of users', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
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
      expect(res.statusCode).toBe(OK);
      userData.push({ token: user.token, authUserId: user.authUserId });
    }

  });
  test('Return empty list of users', () => {});
});

describe('Error returns', () => {
  test('Non-existent tokent', () => {});
  test('Incorrect type for token', () => {});
});