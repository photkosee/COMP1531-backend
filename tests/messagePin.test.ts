import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
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

describe('Testing success pinning message - message/pin/v1', () => {
  test('Channel messages', () => {
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

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'Onse',
        nameLast: 'Numdber',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });

    request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: 1
        },
        headers: {
          'Content-type': 'application/json',
          token: token
        }
      }
    );

    request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 2
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });
    const pin = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(pin).toStrictEqual({});

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });
    const pin2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(pin2).toStrictEqual({});
  });

  test('Dm messages', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[0].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[2].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const bodyObj2 = JSON.parse(res.body as string);

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'df'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'asg86'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const pin = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(pin).toStrictEqual({});

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 3
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const pin2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(pin2).toStrictEqual({});

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 2
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const pin3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(pin3).toStrictEqual({});

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 4
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const pin4 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(pin4).toStrictEqual({});
  });
});

describe('Testing for error - message/pin/v1', () => {
  test('Invalid messageId', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 2
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Not a member', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[0].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Already pinned channel', () => {
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

    request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Already pinned dm', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[0].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('No permission channel', () => {
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

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'Onse',
        nameLast: 'Numdber',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });

    request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: 1
        },
        headers: {
          'Content-type': 'application/json',
          token: token
        }
      }
    );

    request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission dm', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[0].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);

    request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
