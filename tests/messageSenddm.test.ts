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

    let res = request('POST', `${url}:${port}/message/senddm/v1`, {
      json: {
        token: registrationData[1].token,
        dmId: 1, 
        message: 'abc'
      }
    });
    const message = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message).toStrictEqual({ messageId: 1 });

    res = request('POST', `${url}:${port}/message/senddm/v1`, {
      json: {
        token: registrationData[0].token,
        dmId: 2, 
        message: 'abc'
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({ messageId: 2 });
  });

  describe('Testing for error - message/send/v1', () => {
    test('Invalid inputs', () => {
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
  
      let res = request('POST', `${url}:${port}/message/send/v1`, {
        json: {
          token: registrationData[0].token,
          dmId: 1, 
          message: ''
        }
      });
      const message = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message).toStrictEqual(ERROR);
  
      res = request('POST', `${url}:${port}/message/send/v1`, {
        json: {
          token: registrationData[0].token,
          dmId: 1, 
          message: 'abc'
        }
      });
      const message2 = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message2).toStrictEqual(ERROR);

      res = request('POST', `${url}:${port}/message/send/v1`, {
        json: {
          token: registrationData[0].token,
          dmId: 999, 
          message: 'abc'
        }
      });
      const message3 = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message3).toStrictEqual(ERROR);
    });
  });
});
