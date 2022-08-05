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

let dmIdList: any = [];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];
  dmIdList = [];

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
    const res = request('POST', `${url}:${port}/dm/create/v1`, {
      json: {
        token: dmData[i].token,
        uIds: [...dmData[i].uIds],
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    dmIdList.push(bodyObj.dmId);
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Test for invalid dmId - dm/messages/v1', () => {
  const invalidDmIdData = [
    { token: registrationData[0].token, dmId: 3876, start: 0 },
    { token: registrationData[2].token, dmId: '', start: 0 }
  ];

  for (let i = 0; i < invalidDmIdData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: invalidDmIdData[i].token,
          dmId: invalidDmIdData[i].dmId,
          start: invalidDmIdData[i].start
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for invalid start parameter - dm/messages/v1', () => {
  const invalidStartData = [
    { token: registrationData[0].token, dmId: dmIdList[0], start: -1 },
    { token: registrationData[2].token, dmId: dmIdList[1], start: 10000 }
  ];

  for (let i = 0; i < invalidStartData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: invalidStartData[i].token,
          dmId: invalidStartData[i].dmId,
          start: invalidStartData[i].start
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for user is not a member of the DM - dm/messages/v1', () => {
  const invalidMemberData = [
    { token: registrationData[3].token, dmId: dmIdList[0], start: 0 },
    { token: registrationData[3].token, dmId: dmIdList[1], start: 0 }
  ];

  for (let i = 0; i < invalidMemberData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: invalidMemberData[i].token,
          dmId: invalidMemberData[i].dmId,
          start: invalidMemberData[i].start
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for invalid Token Data - dm/messages/v1', () => {
  const invalidTokenData = [
    { token: '', dmId: dmIdList[0], start: 0 },
    { token: 1, dmId: dmIdList[1], start: 0 }
  ];

  for (let i = 0; i < invalidTokenData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: invalidTokenData[i].token,
          dmId: invalidTokenData[i].dmId,
          start: invalidTokenData[i].start
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(ERROR);
  }
});

test('Test for correct functionality - dm/messages/v1', () => {
  const validData = [
    { token: registrationData[0].token, dmId: dmIdList[0], start: 0 },
    { token: registrationData[1].token, dmId: dmIdList[1], start: 0 }
  ];

  for (let i = 0; i < validData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/messages/v1`,
      {
        qs: {
          token: validData[i].token,
          dmId: validData[i].dmId,
          start: validData[i].start
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ messages: expect.any(Array), start: 0, end: -1 });
  }
});