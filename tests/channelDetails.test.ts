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

describe('Valid returns', () => {
  test('User is owner', () => {
  // ===================== SET UP START ================================
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ========================= SET UP END ================================
    res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      name: 'FO9A_CRUNCHIE',
      isPublic: false,
      ownerMembers: [{
        uId: user.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      }],
      allMembers: [{
        uId: user.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      }],
    });
  });

  test('User is member', () => {
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
    // ======================== SET UP END ===========================
    res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token,
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      name: 'FO9A_CRUNCHIE',
      isPublic: true,
      ownerMembers: [{
        uId: userData[GLOBAL].authUserId,
        email: 'global@email.com',
        nameFirst: 'global',
        nameLast: 'Last',
        handleStr: expect.any(String)
      }],
      allMembers: [{
        uId: userData[GLOBAL].authUserId,
        email: 'global@email.com',
        nameFirst: 'global',
        nameLast: 'Last',
        handleStr: expect.any(String)
      },
      {
        uId: userData[USER].authUserId,
        email: 'user@email.com',
        nameFirst: 'user',
        nameLast: 'Last',
        handleStr: expect.any(String)
      }],
    });
  });
});

describe('Return error', () => {
  test('Invalid/non-existent token', () => {
    // ===================== SET UP START ================================
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ========================= SET UP END ================================
    const dummyToken: string = token + 'abc';

    const invalidPassData: any = [
      { token: dummyToken, channelId: channelId },
      { token: false, channelId: channelId },
    ];

    for (const input of invalidPassData) {
      const res = request('GET', `${url}:${port}/channel/details/v3`, {
        json: {
          channelId: input.channelId
        },
        headers: {
          'Content-type': 'application/json',
          token: input.token,
        }
      });
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Invalid/non-existent channelId', () => {
    // ===================== SET UP START ================================
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ========================= SET UP END ================================
    const dummyChannelId: number = channelId + 1;

    const invalidPassData: any = [
      { token: token, channelId: dummyChannelId },
      { token: token, channelId: 'abc' },
    ];

    for (const input of invalidPassData) {
      const res = request('GET', `${url}:${port}/channel/details/v3`, {
        json: {
          channelId: input.channelId
        },
        headers: {
          'Content-type': 'application/json',
          token: input.token,
        }
      });
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('User is not a member', () => {
    //= ==================== SET UP START ================================
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
    // ========================= SET UP END ================================
    res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No channels exist yet', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: -1
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});
