import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Return objects', () => {
  test('Valid inputs', () => {
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

    res = request(
      'GET', `${url}:${port}/channel/details/v2`, {
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

  test('Testing if member but not owner', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user1 = JSON.parse(res.getBody() as string);
    const token1 = user1.token;

    res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'Two',
        nameLast: 'Number',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token1,
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;

    res = request('POST', `${url}:${port}/channel/join/v2`, {
      json: {
        token: token2,
        channelId: channelId,
      }
    });

    res = request(
      'GET', `${url}:${port}/channel/details/v2`, {
        json: {
          token: token2,
          channelId: channelId
        }
      });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      name: 'FO9A_CRUNCHIE',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      },
      {
        uId: user2.authUserId,
        email: 'mal2@email.com',
        nameFirst: 'Two',
        nameLast: 'Number',
        handleStr: 'twonumber'
      }],
    });
  });
});

describe('Return errors', () => {
  test('Return error tests', () => {
    const registrationData: any = [];

    const registeredUser: any = [
      { email: 'mal1@email.com', password: '1234567', nameFirst: 'One', nameLast: 'Number' },
      { email: 'mal2@email.com', password: '1234567', nameFirst: 'Two', nameLast: 'Number' },
      { email: 'mal3@email.com', password: '1234567', nameFirst: 'Three', nameLast: 'Number' },
    ];

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

    let res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: registrationData[0].token,
        name: 'FO9A_CRUNCHIE',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    const channelId = channel.channelId;

    res = request('POST', `${url}:${port}/channel/join/v2`, {
      json: {
        token: registrationData[1].token,
        channelId: channelId,
      }
    });

    const dummyToken = registrationData[0].token + registrationData[1].token +
      registrationData[2].token;
    const dummyChannelId = channelId + 1;

    const invalidPassData = [
      { token: dummyToken, channelId: channelId },
      { token: registrationData[0].token, channelId: dummyChannelId },
      { token: 'abc', channelId: channelId },
      { token: registrationData[0].token, channelId: 'abc' },
      { token: registrationData[3].token, channelId: channelId },
    ];

    for (const test in invalidPassData) {
      const res = request(
        'GET', `${url}:${port}/channel/details`, {
          json: {
            token: invalidPassData[test].token,
            channelId: invalidPassData[test].channelId
          }
        });
      const data = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual(ERROR);
    }
  });
});
