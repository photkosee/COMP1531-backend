import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const FORBIDDEN = 403;

let registrationData: any = [];
let dmIdList: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' },
  { email: 'rathor@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mridul', nameLast: 'Rathor' },
  { email: 'adam@gmail.com', password: 'uhud567T#$%', nameFirst: 'adam', nameLast: 'saund' },
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

test('Test for success dm list fetch - dm/list/v2', () => {
  const validData = [
    { token: registrationData[0].token, expected: [{ dmId: dmIdList[0], name: 'anandsingh, mridulanand, mridulrathor' }, { dmId: dmIdList[1], name: 'anandsingh, mridulanand, mridulrathor' }] },
    { token: registrationData[1].token, expected: [{ dmId: dmIdList[0], name: 'anandsingh, mridulanand, mridulrathor' }, { dmId: dmIdList[1], name: 'anandsingh, mridulanand, mridulrathor' }] },
    { token: registrationData[2].token, expected: [{ dmId: dmIdList[0], name: 'anandsingh, mridulanand, mridulrathor' }, { dmId: dmIdList[1], name: 'anandsingh, mridulanand, mridulrathor' }] },
    { token: registrationData[3].token, expected: [] }
  ];

  for (let i = 0; i < validData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/list/v2`,
      {
        headers: {
          'Content-type': 'application/json',
          token: validData[i].token
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.dms).toStrictEqual(validData[i].expected);
  }
});

test('Test for invalid Token Data - dm/list/v2', () => {
  const invalidTokenData = [
    { token: ' ' }
  ];
  for (let i = 0; i < invalidTokenData.length; i++) {
    const res = request(
      'GET', `${url}:${port}/dm/list/v2`,
      {
        headers: {
          'Content-type': 'application/json',
          token: invalidTokenData[i].token
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  }
});
