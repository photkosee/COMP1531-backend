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

test('Test for successful dm creation - dm/create/v2', () => {
  const validData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < validData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[i].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[i].token
      }
    });
    expect(res.statusCode).toBe(OK);
  }
});

test('Test for any uId in uIds does not refer to a valid user - dm/create/v2', () => {
  const invalidUidData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId, 4] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, 5] },
    { token: registrationData[2].token, uIds: [] },
  ];

  for (let i = 0; i < invalidUidData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...invalidUidData[i].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: invalidUidData[i].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  }
});

test('Test for duplicate uId in uIds - dm/create/v2', () => {
  const duplicateUidData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[2].authUserId] },
  ];

  for (let i = 0; i < duplicateUidData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...duplicateUidData[i].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: duplicateUidData[i].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  }
});

test('Test for creator In Uids Data - dm/create/v2', () => {
  const creatorInUidData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[0].authUserId, registrationData[2].authUserId] },
    { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[2].authUserId, registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < creatorInUidData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...creatorInUidData[i].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: creatorInUidData[i].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  }
});

test('Test for invalid Token Data - dm/create/v2', () => {
  const res = request('POST', `${url}:${port}/dm/create/v2`, {
    body: JSON.stringify({
      uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[1].authUserId]
    }),
    headers: {
      'Content-type': 'application/json',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ4YVJvSTRaNE1obXhwcnFEMjhGa2gucS5GN1cwc09DR3VXaEFLeHd6blhnc09uaWVra0hPRyIsImlhdCI6MTY1ODU3MTc0OH0.7IbUs7eTClwpVxMdQ-8XKsDiGNNbrXhhH0ZSbB_YI5M'
    }
  });
  expect(res.statusCode).toBe(FORBIDDEN);
});
