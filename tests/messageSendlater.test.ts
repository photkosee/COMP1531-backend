import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Invalid message length', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/message/sendlater/v1`, {
    json: {
      channelId: channel1.channelId,
      message: '',
      timeSent: Math.floor(Date.now() / 1000) + 10
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);
});

test('Invalid channelId', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mail1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/message/sendlater/v1`, {
    json: {
      channelId: 1,
      message: 'asdf',
      timeSent: Math.floor(Date.now() / 1000) + 10
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);
});

test('Invalid token', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });

  res = request('POST', `${url}:${port}/message/sendlater/v1`, {
    json: {
      channelId: 1,
      message: 'asdf',
      timeSent: Math.floor(Date.now() / 1000) + 10
    },
    headers: {
      'Content-type': 'application/json',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQxb3NPMG8wb1JrTmVEUllidzRIbUxlRDJXVnRDU0dMTk5yU2FBQm5XVUZJZlhSdHRzZkNJRyIsImlhdCI6MTY1ODU3NzcwNn0.LTPtFI_oV8D4YuSWnWJCMrrYFB6jTt_AOVM3M_c8k3Y'
    }
  });
  expect(res.statusCode).toBe(FORBIDDEN);
});

test('Not a member', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'kiin',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user2 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/message/sendlater/v1`, {
    json: {
      channelId: channel1.channelId,
      message: 'sdfgsdg',
      timeSent: Math.floor(Date.now() / 1000) + 10
    },
    headers: {
      'Content-type': 'application/json',
      token: user2.token
    }
  });
  expect(res.statusCode).toBe(FORBIDDEN);
});

test('timeSent is before current time - message/sendlater', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/message/sendlater/v1`, {
    json: {
      channelId: channel1.channelId,
      message: 'sdfgsdg',
      timeSent: Math.floor(Date.now() / 1000) - 1000
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);
});

test('Successful messageSendlater - message/sendlater', async () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/message/sendlater/v1`, {
    json: {
      channelId: channel1.channelId,
      message: 'sdfgsdg',
      timeSent: (Math.floor(Date.now() / 1000) + 2)
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toBe(OK);

  await new Promise((r) => setTimeout(r, 2000));

  const channelRes1 = request('GET', `${url}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId: channel1.channelId,
        start: 0,
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    }
  );
  const messageArrLength1 = JSON.parse(channelRes1.body as string).messages.length;
  expect(messageArrLength1).toBeGreaterThan(0);
});
