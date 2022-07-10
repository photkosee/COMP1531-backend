import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' },
  { email: 'rathor@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mridul', nameLast: 'Rathor' },
  { email: 'adam@gmail.com', password: 'uhud567T#$%', nameFirst: 'adam', nameLast: 'saund' },
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

  const dmData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < dmData.length; i++) {
    request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: dmData[i].token,
        uIds: [...dmData[i].uIds],
      }
    });
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Test for success dm remove - dm/remove/v1', () => {
  const validData = [
    { token: registrationData[0].token, dmId: 1, expected: {} },
    { token: registrationData[2].token, dmId: 2, expected: {} }
  ];

  for (let i = 0; i < validData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v1`,
      {
        qs: {
          token: validData[i].token,
          dmId: validData[i].dmId
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(validData[i].expected);
  }
});

test('Test for invalid dmId - dm/list/v1', () => {
  const invalidDmIdData = [
    { token: registrationData[0].token, dmId: 3 },
    { token: registrationData[2].token, dmId: 4 }
  ];

  for (let i = 0; i < invalidDmIdData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v1`,
      {
        qs: {
          token: invalidDmIdData[i].token,
          dmId: invalidDmIdData[i].dmId
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for authorised user is no more in the DM - dm/list/v1', () => {
  const invalidAuthUserIdData = [
    { token: registrationData[2].token, dmId: 1 },
    { token: registrationData[1].token, dmId: 2 }
  ];

  for (let i = 0; i < invalidAuthUserIdData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v1`,
      {
        qs: {
          token: invalidAuthUserIdData[i].token,
          dmId: invalidAuthUserIdData[i].dmId
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for invalid Token Data - dm/list/v1', () => {
  const invalidTokenData = [
    { token: '', dmId: 1 },
    { token: 1, dmId: 2 }
  ];

  for (let i = 0; i < invalidTokenData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v1`,
      {
        qs: {
          token: invalidTokenData[i].token,
          dmId: invalidTokenData[i].dmId
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});
