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

test('Test for successful dm creation - dm/create/v1', () => {
  const validData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < validData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: validData[i].token,
        uIds: [...validData[i].uIds],
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ dmId: i + 1 });
  }
});

test('Test for any uId in uIds does not refer to a valid user - dm/create/v1', () => {
  const invalidUidData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId, 4] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, 5] },
    { token: registrationData[2].token, uIds: [] },
  ];

  for (let i = 0; i < invalidUidData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: invalidUidData[i].token,
        uIds: [...invalidUidData[i].uIds],
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for duplicate uId in uIds - dm/create/v1', () => {
  const duplicateUidData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[2].authUserId] },
  ];

  for (let i = 0; i < duplicateUidData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: duplicateUidData[i].token,
        uIds: [...duplicateUidData[i].uIds],
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for creator In Uids Data - dm/create/v1', () => {
  const creatorInUidData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[0].authUserId, registrationData[2].authUserId] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[2].authUserId, registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < creatorInUidData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: creatorInUidData[i].token,
        uIds: [...creatorInUidData[i].uIds],
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for invalid Token Data - dm/create/v1', () => {
  const invalidTokenData: any = [
    { token: '', uIds: [registrationData[1].authUserId, registrationData[0].authUserId, registrationData[2].authUserId] },
    { token: 8265434234, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
    { token: 1, uIds: [registrationData[2].authUserId, registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < invalidTokenData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: invalidTokenData[i].token,
        uIds: [...invalidTokenData[i].uIds],
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});
