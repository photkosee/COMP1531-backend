import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'a', nameLast: 'a' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'b', nameLast: 'b' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'c', nameLast: 'c' },
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
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Testing invalid token - notifications/get', () => {
  const res = request('GET', `${url}:${port}/notifications/get/v1`, {
    headers: {
      'Content-type': 'application/json',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ1Y0QzVjJLN01PU1RHTU1WWVFtbHBlc1UvZWwuTjB3SDZ0d3laY0VhZThjekUvcktkV2F0RyIsImlhdCI6MTY1ODU3NzcyNn0.7AWJbHt9-LMfsQiXHpY0exa9gL0yqsvQoPzIYNQAeUY'
    }
  });
  expect(res.statusCode).toStrictEqual(FORBIDDEN);
});

describe('Testing successful notification get - notifications/get', () => {
  test('successful tagging notification in channel', async() => {
    let res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: ({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      json: ({
        channelId: 1,
        message: '@aa@ hello'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: ({
        channelId: 1,
        message: '@aa@ again',
        timeSent: (Math.floor(Date.now() / 1000) + 1.5)
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    await new Promise((r) => setTimeout(r, 2500));

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif for add to dm', () => {
    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [registrationData[1].authUserId],
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful tagging notification in dm', async() => {
    let res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: 1,
        message: '@bb@ hello1'
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: 1,
        message: '@bb/ hello2'
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: 1,
        message: '@aa@ hello again',
        timeSent: (Math.floor(Date.now() / 1000) + 1.5)
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    await new Promise((r) => setTimeout(r, 2500));

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif for message react in channel', () => {
    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: 1
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    }
    );

    let res = request('POST', `${url}:${port}/message/react/v1`, {
      json: ({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif for message react in dm', () => {
    let res = request('POST', `${url}:${port}/message/react/v1`, {
      json: ({
        messageId: 3,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif for invite to channel', () => {
    request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: 1,
        uId: registrationData[2].authUserId
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif message edit in channel', () => {
    let res = request('PUT', `${url}:${port}/message/edit/v2`, {
      json: {
        messageId: 1,
        message: '@bb/'
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif message edit in dm', () => {
    let res = request('PUT', `${url}:${port}/message/edit/v2`, {
      json: {
        messageId: 3,
        message: '@bb/'
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
});
