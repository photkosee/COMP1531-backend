import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Testing for successful invite - channel/invite/v2', () => {
  const registrationData = [];
  const registeredUsers = [
    { email: 'user1@email.com', password: 'password1', nameFirst: 'john', nameLast: 'smith' },
    { email: 'user2@email.com', password: 'password2', nameFirst: 'ben', nameLast: 'affleck' },
    { email: 'user3@email.com', password: 'password3', nameFirst: 'keith', nameLast: 'ledger' },
    { email: 'user4@email.com', password: 'password4', nameFirst: 'annie', nameLast: 'ban' },
    { email: 'user5@email.com', password: 'password5', nameFirst: 'kim', nameLast: 'loo' },
  ];
  for (const users of registeredUsers) {
    const res = request('POST', `${url}:${port}/auth/register/v2`, {
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

  let res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const inviteResponse1 = JSON.parse(res.body as string);
  expect(inviteResponse1).toStrictEqual({});

  res = request('GET', `${url}:${port}/channel/details/v2`, {
    qs: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  });
  const channel1Details = JSON.parse(res.body as string);
  res = request('GET', `${url}:${port}/user/profile/v2`, {
    qs: {
      token: registrationData[0].token,
      uId: registrationData[0].authUserId,
    }
  });
  const user1Profile = JSON.parse(res.body as string);
  res = request('GET', `${url}:${port}/user/profile/v2`, {
    qs: {
      token: registrationData[1].token,
      uId: registrationData[1].authUserId,
    }
  });
  const user2Profile = JSON.parse(res.body as string);
  expect(channel1Details.allMembers.length).toStrictEqual(2);
  expect(channel1Details.allMembers).toContainEqual(user1Profile.user);
  expect(channel1Details.allMembers).toContainEqual(user2Profile.user);

  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: registrationData[3].token,
      channelId: channel1.channelId,
    }
  });

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const invite1 = JSON.parse(res.body as string);
  expect(invite1).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[2].token,
      channelId: channel1.channelId,
      uId: registrationData[4].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const invite2 = JSON.parse(res.body as string);
  expect(invite2).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[4].token,
      channelId: channel1.channelId,
      uId: registrationData[3].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const invite3 = JSON.parse(res.body as string);
  expect(invite3).toStrictEqual(ERROR);
});

test('Testing with valid channelId and invalid uId', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@email.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@email.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of reqisteredUser) {
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

  let res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);

  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
    }

  });

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  });
  const channelInviteResponse = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInviteResponse).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  });
  const channelInviteResponse1 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInviteResponse1).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: 'randomToken',
      channelId: channel1.channelId,
      uId: registrationData[1],
    }
  });
  const channelInviteResponse2 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInviteResponse2).toStrictEqual(ERROR);
});

test('Testing for invalid channel', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of reqisteredUser) {
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

  let res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: 0.1,
      uId: 0.1,
    }
  });
  const channelInvite1 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInvite1).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: 0.1,
      uId: registrationData[1].authUserId,
    }
  });
  const channelInvite2 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInvite2).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: 'randomToken',
      channelId: 0.1,
      uId: registrationData[1].authUserId,
    }
  });
  const channelInvite3 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInvite3).toStrictEqual(ERROR);
});

test('Testing for token and uId are same person', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@email.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@email.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of reqisteredUser) {
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

  let res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[0].authUserId,
    }
  });
  const channelInvite1 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInvite1).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/channel/invite/v2`, {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  });
  const channelInvite2 = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(channelInvite2).toStrictEqual(ERROR);
});
