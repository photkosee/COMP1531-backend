import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;

const port = config.port;
const url = config.url;

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

afterAll(() => {
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
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
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

    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[GLOBAL].token,
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================

    const res1 = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: channelId
        },
        headers: {
          'Content-type': 'application/json',
          token: userData[USER].token,
        }
      }
    );
    expect(res1.statusCode).toBe(OK);
  });

  test('Add global owner to a private channel', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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
      expect(res.statusCode).toBe(OK);
      userData.push({ token: user.token, authUserId: user.authUserId });
    }

    let res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token,
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================
    res = request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[GLOBAL].token,
      }
    });
    expect(res.statusCode).toBe(OK);
  });
});

describe('Error returns', () => {
  test('Invalid/non-existent token', () => {
    // ======================== SET UP START ===========================
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'global@email.com',
        password: '1234567',
        nameFirst: 'global',
        nameLast: 'Last'
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token: string = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId: number = channel.channelId;
    // ======================== SET UP END ===========================
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRqMkdrY3FJUFEvZ3hiRjRzbUYvck1lcndPUU13VHJYSnIwRy5hRnRxcURUVkppWTdpZFhLbSIsImlhdCI6MTY1ODU3NzYzNH0.yH6ATBlI46lkfxdojeOFi0ZdDfZMDeV6GoXcDNQjL9Y';

    const invalidPassData: any = [
      { token: dummyToken, channelId: channelId, error: FORBIDDEN },
      { token: 'abc', channelId: channelId, error: FORBIDDEN },
    ];

    for (let pos = 0; pos < invalidPassData.length; pos++) {
      res = request(
        'POST', `${url}:${port}/channel/join/v3`, {
          json: {
            channelId: invalidPassData[pos].channelId
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidPassData[pos].token,
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Invalid/non-existent channelId', () => {
    // ======================== SET UP START ===========================
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'global@email.com',
        password: '1234567',
        nameFirst: 'global',
        nameLast: 'Last'
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token: string = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId: number = channel.channelId;
    // ======================== SET UP END ===========================
    const dummyChannelId: number = channelId + 1;

    const invalidPassData: any = [
      { token: token, channelId: dummyChannelId },
      { token: token, channelId: 'abc' },
    ];

    for (let pos = 0; pos < invalidPassData.length; pos++) {
      res = request(
        'POST', `${url}:${port}/channel/join/v3`, {
          json: {
            channelId: invalidPassData[pos].channelId
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidPassData[pos].token,
          }
        }
      );
      expect(res.statusCode).toStrictEqual(BADREQUEST);
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
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
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

    let res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[GLOBAL].token,
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================
    res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: channelId
        },
        headers: {
          'Content-type': 'application/json',
          token: userData[GLOBAL].token,
        }
      }
    );
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Adding a non-global owner to a private channel', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'global@email.com', password: '1234567', nameFirst: 'global', nameLast: 'Last' },
      { email: 'user@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
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
      expect(res.statusCode).toBe(OK);
      userData.push({ token: user.token, authUserId: user.authUserId });
    }

    let res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[GLOBAL].token,
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ======================== SET UP END ===========================
    res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: channelId
        },
        headers: {
          'Content-type': 'application/json',
          token: userData[USER].token,
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
