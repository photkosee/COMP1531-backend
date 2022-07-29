import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];
let channelId1: number;
let channelId2: number;

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' }
];

beforeAll(() => {
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

  const channelCreation1 = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'private channel',
      isPublic: false,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token,
    }
  });
  channelId1 = JSON.parse(channelCreation1.body as string).channelId;

  const channelCreation2 = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'public channel',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[1].token,
    }
  });
  channelId2 = JSON.parse(channelCreation2.body as string).channelId;
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Test Cases for HTTP Route: standup/start/v1', () => {
  test('Test for successful standup start', () => {
    const successRes = request('POST', `${url}:${port}/standup/start/v1`, {
      body: JSON.stringify({
        channelId: channelId1,
        length: 5,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    const timeFinish = JSON.parse(successRes.body as string).timeFinish;
    expect(successRes.statusCode).toBe(OK);
    expect(timeFinish).toBeLessThanOrEqual(Math.floor((new Date()).getTime() / 1000) + 10);
  });

  test('Test for an active standup is currently running in the channel', () => {
    const successRes = request('POST', `${url}:${port}/standup/start/v1`, {
      body: JSON.stringify({
        channelId: channelId1,
        length: 5,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(successRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for channelId does not refer to a valid channel', () => {
    const successRes = request('POST', `${url}:${port}/standup/start/v1`, {
      body: JSON.stringify({
        channelId: -1,
        length: 5,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(successRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for length is a negative integer', () => {
    const successRes = request('POST', `${url}:${port}/standup/start/v1`, {
      body: JSON.stringify({
        channelId: channelId2,
        length: -1,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(successRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for authorised user is not a member of the channel', () => {
    const successRes = request('POST', `${url}:${port}/standup/start/v1`, {
      body: JSON.stringify({
        channelId: channelId2,
        length: 5,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(successRes.statusCode).toBe(FORBIDDEN);
  });

  test('Test for invalid token', () => {
    const successRes = request('POST', `${url}:${port}/standup/start/v1`, {
      body: JSON.stringify({
        channelId: channelId2,
        length: 5,
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRsMVZucmdFaWtJWW9WaTFuMm5IUnh1c0h5RTR2eG91MUpYYVdZQUhxQVpES2ROQkxUOG5CQyIsImlhdCI6MTY1ODU3MTgyMn0.gIEJWGL8CsuXkAodgWWF7jSVleFfR9f60HW-tfao3no'
      }
    });
    expect(successRes.statusCode).toBe(FORBIDDEN);
  });
});

describe('Test Cases for HTTP Route: standup/active/v1', () => {
  test('Test if standup is active', () => {
    const successRes = request('POST', `${url}:${port}/standup/active/v1`, {
      body: JSON.stringify({
        channelId: channelId1,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    const resData = JSON.parse(successRes.body as string);
    expect(successRes.statusCode).toBe(OK);
    expect(resData.isActive).toBe(true);
    expect(resData.timeFinish).toStrictEqual(expect.any(Number));
  });

  test('Test if no-standup is active', () => {
    const successRes = request('POST', `${url}:${port}/standup/active/v1`, {
      body: JSON.stringify({
        channelId: channelId2,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    const resData = JSON.parse(successRes.body as string);
    expect(successRes.statusCode).toBe(OK);
    expect(resData.isActive).toBe(false);
    expect(resData.timeFinish).toBe(null);
  });

  test('Test for channelId does not refer to a valid channel', () => {
    const successRes = request('POST', `${url}:${port}/standup/active/v1`, {
      body: JSON.stringify({
        channelId: -1,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(successRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for authorised user is not a member of the channel', () => {
    const successRes = request('POST', `${url}:${port}/standup/active/v1`, {
      body: JSON.stringify({
        channelId: channelId2,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(successRes.statusCode).toBe(FORBIDDEN);
  });

  test('Test for invalid token', () => {
    const successRes = request('POST', `${url}:${port}/standup/active/v1`, {
      body: JSON.stringify({
        channelId: channelId2,
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRsMVZucmdFaWtJWW9WaTFuMm5IUnh1c0h5RTR2eG91MUpYYVdZQUhxQVpES2ROQkxUOG5CQyIsImlhdCI6MTY1ODU3MTgyMn0.gIEJWGL8CsuXkAodgWWF7jSVleFfR9f60HW-tfao3no'
      }
    });
    expect(successRes.statusCode).toBe(FORBIDDEN);
  });
});
