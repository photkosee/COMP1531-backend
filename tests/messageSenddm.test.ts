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

describe('Testing success sending message - message/senddm/v2', () => {
  test('Owner sending message', () => {
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

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({ messageId: 1 });

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual({ messageId: 2 });
  });

  test('Members sending message', () => {
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

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({ messageId: 1 });

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual({ messageId: 2 });
  });
});

describe('Testing for error - message/send/v2', () => {
  test('Invalid message length', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const bodyObj1 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj1.dmId,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid dmId', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    const res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: -5,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const bodyObj1 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj1.dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR1WWtZNzh4MGVIMmFNQ0RZN0JZMXgubVEwUUo4cElaOXk5VEk5SFJ6NFhrYVRiU0xzS25PdSIsImlhdCI6MTY1ODU3NzY5N30.6tHgcav_HUnDzF7Y3uLRBvFaGCFKDYwKRICMZmMW36A'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not a member', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[2].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const bodyObj2 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
