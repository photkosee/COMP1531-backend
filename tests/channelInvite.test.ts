import request from 'sync-request';
import config from '../src/config.json';

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

test('Testing for cases where user already in channel', () => {
  const registrationData = [];
  const registeredUsers = [
    { email: 'user1@email.com', password: 'password1', nameFirst: 'john', nameLast: 'smith' },
    { email: 'user2@email.com', password: 'password2', nameFirst: 'ben', nameLast: 'affleck' },
    { email: 'user3@email.com', password: 'password3', nameFirst: 'keith', nameLast: 'ledger' },
  ];
  for (const users of registeredUsers) {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: users.email,
        password: users.password,
        nameFirst: users.nameFirst,
        nameLast: users.nameLast,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }
  let res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  const channel1 = JSON.parse(res.body as string);

  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[1].token
    }
  });

  res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  expect(res.statusCode).toStrictEqual(BADREQUEST);
});

test('Testing with valid channelId and invalid uId', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@email.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@email.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of reqisteredUser) {
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

  let res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  const channel1 = JSON.parse(res.body as string);

  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[1].token
    }
  });

  res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: channel1.channelId,
      uId: 0.1,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  expect(res.statusCode).toStrictEqual(BADREQUEST);

  res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: channel1.channelId,
      uId: registrationData[1],
    },
    headers: {
      'Content-type': 'application/json',
      token: 'randomtoken'
    }
  });
  expect(res.statusCode).toStrictEqual(FORBIDDEN);
});

test('Testing for invalid channel', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of reqisteredUser) {
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

  const res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: 0.1,
      uId: registrationData[1].authUserId,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  expect(res.statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for token and uId are same person', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@email.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@email.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
    { email: 'userasdf2@email.com', password: '123456', nameFirst: 'firdst2', nameLast: 'lafst2' },
  ];
  for (const user of reqisteredUser) {
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

  let res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  const channel1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: channel1.channelId,
      uId: registrationData[0].authUserId,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  expect(res.statusCode).toStrictEqual(BADREQUEST);

  res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    },
    headers: {
      'Content-type': 'application/json',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ1Y0QzVjJLN01PU1RHTU1WWVFtbHBlc1UvZWwuTjB3SDZ0d3laY0VhZThjekUvcktkV2F0RyIsImlhdCI6MTY1ODU3NzcyNn0.7AWJbHt9-LMfsQiXHpY0exa9gL0yqsvQoPzIYNQAeUY'
    }
  });
  expect(res.statusCode).toStrictEqual(FORBIDDEN);

  res = request('POST', `${url}:${port}/channel/invite/v3`, {
    json: {
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[2].token
    }
  });
  expect(res.statusCode).toStrictEqual(FORBIDDEN);
});
