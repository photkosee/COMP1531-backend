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

describe('Valid return', () => {
  test('Valid change of handle', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: token,
        handle: 'newHandle1'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
  test('Change to existing user\'s handle', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: token,
        handle: 'firstlast'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
});

describe('Handle error returns', () => {
  test('Invalid handle length', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: token,
        handle: 'fir'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Invaid handle characters', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: token,
        handle: 'fir!rgse'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Invaid handle type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: token,
        handle: true
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
  test('Handle is used by another user', () => {
       // ======================== SET UP START ===========================
       const userData: authRegisterObj[] = [];
       const userInput = [
         { email: 'original@email.com', password: '1234567', nameFirst: 'original', nameLast: 'Last' },
         { email: 'copy@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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
    // ======================== SET UP END ===========================
    let res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: userData[0].token,
        handle: 'userlast'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});

describe('Token error returns', () => {
  test('Non-existent token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;
    const dummyToken = token + 'abc';

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: dummyToken,
        handle: 'newHandle'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Invaid token type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v1`, {
      json: {
        token: 1,
        handle: 'newHandle'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});