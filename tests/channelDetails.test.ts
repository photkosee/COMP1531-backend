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

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid returns', () => {
  test('User is owner', () => {
  // ===================== SET UP START ================================
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ========================= SET UP END ================================
    res = request('GET', `${url}:${port}/channel/details/v2`, {
      qs: {
        token: token,
        channelId: channelId
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

    res = request(
      'POST', `${url}:${port}/channel/join/v2`, {
        json: {
          token: userData[USER].token,
          channelId: channelId
        }
      }
    );
    // ======================== SET UP END ===========================
    res = request('GET', `${url}:${port}/channel/details/v2`, {
      qs: {
        token: userData[USER].token,
        channelId: channelId
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
  test('Invalid/non-existent token and channelId', () => {
    // ===================== SET UP START ================================
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user: authRegisterObj = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      }
    });
    const channel: channelsCreateObj = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;
    // ========================= SET UP END ================================
    const dummyToken: string = token + 'abc';
    const dummyChannelId: number = channelId + 1;

    const invalidPassData: any = [
      { token: dummyToken, channelId: channelId },
      { token: token, channelId: dummyChannelId },
      { token: false, channelId: channelId },
      { token: token, channelId: 'abc' },
    ];

    for (const input of invalidPassData) {
      const res = request('GET', `${url}:${port}/channel/details/v2`, {
        json: {
          token: input.token,
          channelId: input.channelId
        }
      });
      const data = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual(ERROR);
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
    // ========================= SET UP END ================================
    res = request('GET', `${url}:${port}/channel/details/v2`, {
      qs: {
        token: userData[USER].token,
        channelId: channelId
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});
