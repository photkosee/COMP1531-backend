import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mjghridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'anand', nameLast: 'Singh' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mriuffhdul', nameLast: 'Rathor' },
];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];

  for (const user of registeredUser) {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
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
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing message - message', () => {
  test('Combined message', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [registrationData[2].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const dm1 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const dm2 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const ch1 = JSON.parse(res.body as string);

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: ch1.channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const ch2 = JSON.parse(res.body as string);

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: ch2.channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: ch1.channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: ch1.channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms2 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: ch2.channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms3 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dm1.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms4 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dm2.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms5 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dm1.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms4.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms5.messageId,
        message: 'asdf',
        channelId: ch1.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms3.messageId,
        message: 'asdf',
        channelId: ch1.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms2.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm1.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms4.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm1.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms3.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms3.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms5.messageId,
        message: 'asdf',
        channelId: ch2.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 5
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 3
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: 3
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: 5
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'zzz'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 5,
        message: 'zzz'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 6,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: 3
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: 5
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });
});
