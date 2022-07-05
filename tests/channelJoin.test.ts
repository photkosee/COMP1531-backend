import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

const userData = [];
let channelId = 0;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

beforeEach(() => {
  const userInput = [
    { email: 'mal1@email.com', password: '1234567', nameFirst: 'One', nameLast: 'Number' },
    { email: 'mal2@email.com', password: '1234567', nameFirst: 'One', nameLast: 'Number' },
  ];

  for (const users of userInput) {
    const res = request(
      'POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: users.email,
          password: users.password,
          nameFirst: users.nameFirst,
          nameLast: users.nameLast
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    userData.push({ token: data.token, authUserId: data.authUserId });
  }

  const res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: userData[0].token,
      name: 'FO9A_CRUNCHIE',
      isPublic: false
    }
  });
  const channel = JSON.parse(res.getBody() as string);
  channelId = channel.channelId;
});

describe('Valid returns', () => {
  test('Valid user id and valid channel id', () => {
    const res = request(
      'POST', `${url}:${port}/channel/join/v2 `, {
        json: {
          token: userData[1].token,
          channelId: channelId
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });

  test('Private channel, adding a global owner', () => {
    const res = request(
      'POST', `${url}:${port}/channel/join/v2`, {
        json: {
          token: userData[0].token,
          channelId: channelId
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
});

describe('Error returns', () => {
  test('Invalid tokens and ids', () => {
    const dummyChannelId = channelId + 1;
    const dummyToken = userData[0].token + userData[1].token;

    const invalidPassData = [
      { token: dummyToken, channelId: channelId },
      { token: userData[0].token, channelId: dummyChannelId },
      { token: 'abc', channelId: channelId },
      { token: userData[0].token, channelId: 'abc' },
    ];

    for (let pos = 0; pos < invalidPassData.length; pos++) {
      const res = request(
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

  test('Authorised user is already a member', () => {
    request(
      'POST', `${url}:${port}/channel/join/v2 `, {
        json: {
          token: userData[1].token,
          channelId: channelId
        }
      }
    );

    const passData = [
      { token: userData[0].token, channelId: channelId },
      { token: userData[1].token, channelId: channelId },
    ];

    for (let pos = 0; pos < passData.length; pos++) {
      const res = request(
        'POST', `${url}:${port}/channel/join/v2`, {
          json: {
            token: passData[pos].token,
            channelId: passData[pos].channelId
          }
        }
      );
      const data = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({ error: 'error' });
    }
  });

  test('Private channel, adding not a global owner', () => {
    const res = request(
      'POST', `${url}:${port}/channel/join/v2`, {
        json: {
          token: userData[1].token,
          channelId: channelId
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});
