import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

const GLOBAL = 0;
const USER = 1;

interface authRegisterObj {
    token: string,
    authUserId: number
}

interface channelsCreateObj {
  channelId: number
}

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid return', () => {
  test('Add new user to a public channel', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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

    const res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: userData[GLOBAL].token,
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================

    const res1 = request(
      'POST', `${url}:${port}/channel/join/v2`, {
        json: {
          token: userData[USER].token,
          channelId: channelId
        }
      }
    );
    const channelJoin = JSON.parse(res1.getBody() as string);
    expect(res1.statusCode).toBe(OK);
    expect(channelJoin).toStrictEqual({});
  });

  test('Add global owner to a private channel', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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

    let res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: userData[USER].token,
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================
    res = request('POST', `${url}:${port}/channel/join/v2`, {
      json: {
        token: userData[GLOBAL].token,
        channelId: channelId
      }
    });
    const channelJoin = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelJoin).toStrictEqual({});
  });
});

describe('Error returns', () => {
  test('Invalid/non-existent token and channelId', () => {
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
    const token: string = user.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId: number = channel.channelId;
    // ======================== SET UP END ===========================
    const dummyChannelId: number = channelId + 1;
    const dummyToken: string = token + 'abc';

    const invalidPassData: any = [
      { token: dummyToken, channelId: channelId },
      { token: token, channelId: dummyChannelId },
      { token: 'abc', channelId: channelId },
      { token: token, channelId: 'abc' },
    ];

    for (let pos = 0; pos < invalidPassData.length; pos++) {
      res = request(
        'POST', `${url}:${port}/channel/join/v2`, {
          json: {
            token: invalidPassData[pos].token,
            channelId: invalidPassData[pos].channelId
          }
        }
      );
      const data = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({ error: 'error' });
    }
  });

  test('User is already a member', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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

    let res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: userData[GLOBAL].token,
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================
    res = request(
      'POST', `${url}:${port}/channel/join/v2`, {
        json: {
          token: userData[GLOBAL].token,
          channelId: channelId
        }
      }
    );
    const channelJoin = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelJoin).toStrictEqual(ERROR);
  });

  test('Adding a non-global owner to a private channel', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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

    let res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: userData[GLOBAL].token,
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================
    res = request(
      'POST', `${url}:${port}/channel/join/v2`, {
        json: {
          token: userData[USER].token,
          channelId: channelId
        }
      }
    );
    const channelJoin = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelJoin).toStrictEqual(ERROR);
  });
});
