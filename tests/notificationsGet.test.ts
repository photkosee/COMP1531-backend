import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
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
  test('successful tagging notification in channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user = JSON.parse(res.body as string);
    const token = user.token;
    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: '@johnsmith@ hello'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
  test('successful notif for add to dm', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId],
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });

    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
  test('successful tagging notification in dm', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId],
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: 1,
        message: '@johnsmith@ hello1'
      },
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: 1,
        message: '@benaffleck/ hello2'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
  test('successful notif for message react in channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      json: {
        channelId: 1,
        message: 'hello'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const message = JSON.parse(res.body as string);
    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: 1
      },
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    }
    );
    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: message.messageId,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
  test('successful notif for message react in dm', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId],
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: 1,
        message: 'hello'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const message = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: message.messageId,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });

  test('successful notif for invite to channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'DOTA2',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });

    request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: 1,
        uId: user2.authUserId
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
  test('successful notif message edit in channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'DOTA2',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: 1
      },
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    res = request('POST', `${url}:${port}/message/send/v2`, {
      json: {
        channelId: 1,
        message: 'hello'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const message = JSON.parse(res.body as string);
    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      json: {
        messageId: message.messageId,
        message: '@benaffleck/'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
  test('successful notif message edit in dm', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: '123456',
        nameFirst: 'john',
        nameLast: 'smith',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user2@email.com',
        password: '123456',
        nameFirst: 'ben',
        nameLast: 'affleck',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId]
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const dm1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: dm1.dmId,
        message: 'hello'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const message = JSON.parse(res.body as string);
    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      json: {
        messageId: message.messageId,
        message: '@benaffleck/'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      json: {
        messageId: message.messageId,
        message: '@johnsmith/'
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user2.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
    res = request('GET', `${url}:${port}/notifications/get/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    expect(res.statusCode).toStrictEqual(OK);
  });
});
