import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];
let dmIdList: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' },
  { email: 'rathor@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mridul', nameLast: 'Rathor' }
];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];
  dmIdList = [];

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

  const dmData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < dmData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...dmData[i].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: dmData[i].token
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    dmIdList.push(bodyObj.dmId);
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Test for success dm remove - dm/remove/v2', () => {
  const validData = [
    { token: registrationData[0].token, dmId: dmIdList[0] },
    { token: registrationData[2].token, dmId: dmIdList[1] }
  ];

  for (let i = 0; i < validData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v2`,
      {
        qs: {
          dmId: validData[i].dmId
        },
        headers: {
          'Content-type': 'application/json',
          token: validData[i].token
        }
      }
    );
    expect(res.statusCode).toBe(OK);
  }
});

test('Test for invalid dmId - dm/remove/v2', () => {
  const invalidDmIdData = [
    { token: registrationData[0].token, dmId: 8793 },
    { token: registrationData[2].token, dmId: '' }
  ];

  for (let i = 0; i < invalidDmIdData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v2`,
      {
        qs: {
          dmId: invalidDmIdData[i].dmId
        },
        headers: {
          'Content-type': 'application/json',
          token: invalidDmIdData[i].token
        }
      }
    );
    expect(res.statusCode).toBe(BADREQUEST);
  }
});

test('Test for authorised user is no more in the DM - dm/remove/v2', () => {
  const invalidAuthUserIdData = [
    { token: registrationData[2].token, dmId: dmIdList[0] },
    { token: registrationData[1].token, dmId: dmIdList[1] }
  ];

  for (let i = 0; i < invalidAuthUserIdData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v2`,
      {
        qs: {
          dmId: invalidAuthUserIdData[i].dmId
        },
        headers: {
          'Content-type': 'application/json',
          token: invalidAuthUserIdData[i].token
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  }
});

test('Test for invalid Token Data - dm/remove/v2', () => {
  const invalidTokenData = [
    { token: ' ', dmId: dmIdList[0] },
    { token: '9876567890123', dmId: dmIdList[1] }
  ];

  for (let i = 0; i < invalidTokenData.length; i++) {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v2`,
      {
        qs: {
          dmId: invalidTokenData[i].dmId
        },
        headers: {
          'Content-type': 'application/json',
          token: invalidTokenData[i].token
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  }
});
