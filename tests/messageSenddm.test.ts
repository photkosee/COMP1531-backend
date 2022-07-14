import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

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
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing success sending message - message/senddm/v1', () => {
  test('valid inputs', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[0].token,
        uIds: [...validData[0].uIds],
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj0).toStrictEqual({ dmId: expect.any(Number) });

    res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[1].token,
        uIds: [...validData[1].uIds],
      }
    });
    const bodyObj1 = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj1).toStrictEqual({ dmId: expect.any(Number) });

    res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[2].token,
        uIds: [...validData[2].uIds],
      }
    });
    const bodyObj2 = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj2).toStrictEqual({ dmId: expect.any(Number) });

    res = request('POST', `${url}:${port}/message/senddm/v1`, {
      json: {
        token: registrationData[0].token,
        dmId: bodyObj2.dmId,
        message: 'abc'
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({ messageId: 1 });
  });
});

describe('Testing for error - message/send/v1', () => {
  test('Invalid inputs', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[0].token,
        uIds: [...validData[0].uIds],
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj0).toStrictEqual({ dmId: expect.any(Number) });

    res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[1].token,
        uIds: [...validData[1].uIds],
      }
    });
    const bodyObj1 = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj1).toStrictEqual({ dmId: expect.any(Number) });

    res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[2].token,
        uIds: [...validData[2].uIds],
      }
    });
    const bodyObj2 = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj2).toStrictEqual({ dmId: expect.any(Number) });

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: registrationData[0].token,
        dmId: bodyObj1.dmId,
        message: ''
      }
    });
    const message = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message).toStrictEqual(ERROR);

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: registrationData[0].token,
        dmId: bodyObj1.dmId,
        message: 'abc'
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual(ERROR);

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: registrationData[0].token,
        dmId: -555,
        message: 'abc'
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual(ERROR);
  });
});
