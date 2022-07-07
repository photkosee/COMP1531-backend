import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

const post = (path: any, body: any) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const bodyObj = JSON.parse(String(res.body));
  return bodyObj;
};

test('Tests for successful invite - channel/invite/v2', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
    { email: 'user3@bar.com', password: '123456', nameFirst: 'first3', nameLast: 'last3' },
    { email: 'user4@bar.com', password: '123456', nameFirst: 'first4', nameLast: 'last4' },
    { email: 'user5@bar.com', password: '123456', nameFirst: 'first5', nameLast: 'last5' },
    { email: 'user6@bar.com', password: '123456', nameFirst: 'first6', nameLast: 'last6' },
    { email: 'user7@bar.com', password: '123456', nameFirst: 'first7', nameLast: 'last7' },
    { email: 'user8@bar.com', password: '123456', nameFirst: 'first8', nameLast: 'last8' },
  ];
  for (const user of reqisteredUser) {
    const res = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const bodyObj = JSON.parse(String(res.body));
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }

  let res = post('channel/create/v2', {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(String(res.body));

  res = post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  });
  const inviteResponse1 = JSON.parse(String(res.body));
  expect(inviteResponse1).toStrictEqual({});

  res = request('GET', `${url}:${port}/channel/details/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  });
  let channel1Details = JSON.parse(String(res.body));
  res = request('GET', `${url}:${port}/user/profile/v2`, {
    json: {
      token: registrationData[0].token,
      uId: registrationData[0].authUserId,
    }
  });
  const user1Profile = JSON.parse(String(res.body));
  res = request('GET', `${url}:${port}/user/profile/v2`, {
    json: {
      token: registrationData[1].token,
      uId: registrationData[1].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const user2Profile = JSON.parse(String(res.body));
  expect(channel1Details.allMembers.length).toStrictEqual(2);
  expect(channel1Details.allMembers).toContainEqual(user1Profile.user);
  expect(channel1Details.allMembers).toContainEqual(user2Profile.user);

  post('channel/join/v2', {
    token: registrationData[2].token,
    channelId: channel1.channelId
  });
  post('channel/join/v2', {
    token: registrationData[3].token,
    channelId: channel1.channelId
  });
  post('channel/join/v2', {
    token: registrationData[7].token,
    channelId: channel1.channelId
  });

  res = request('GET', `${url}:${port}/channel/details/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  });
  expect(res.statusCode).toBe(OK);
  channel1Details = JSON.parse(String(res.body));
  expect(channel1Details.allMembers.length).toStrictEqual(5);

  
  res = post('channel/invite/v2', {
    json: {
      token: registrationData[2].token,
      channelId: channel1.channelId,
      uId: registrationData[3].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const invite1 = JSON.parse(String(res.body));
  expect(invite1).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: registrationData[4].token,
      channelId: channel1.channelId,
      uId: registrationData[5].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const invite2 = JSON.parse(String(res.body));
  expect(invite2).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: registrationData[6].token,
      channelId: channel1.channelId,
      uId: registrationData[7].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const invite3 = JSON.parse(String(res.body));
  expect(invite3).toStrictEqual(ERROR); 

  res = request('GET', `${url}:${port}/channel/details/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  });
  expect(res.statusCode).toBe(OK);
  channel1Details = JSON.parse(String(res.body));
  expect(channel1Details.allMembers.length).toStrictEqual(5);
});

test('Testing with valid ChannelId and invalid uId', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
    { email: 'user6@bar.com', password: '123456', nameFirst: 'first6', nameLast: 'last6' },
    { email: 'user8@bar.com', password: '123456', nameFirst: 'first8', nameLast: 'last8' },
  ];
  for (const user of reqisteredUser) {
    const res = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const bodyObj = JSON.parse(String(res.body));
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }
  let res = post('channel/create/v2', {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(String(res.body));
  post('channel/join/v2', {
    token: registrationData[3].token,
    channelId: channel1.channelId
  });

  res = post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInviteResponse = JSON.parse(String(res.body));
  expect(channelInviteResponse).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInviteResponse1 = JSON.parse(String(res.body));
  expect(channelInviteResponse1).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: registrationData[2].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInviteResponse2 = JSON.parse(String(res.body));
  expect(channelInviteResponse2).toStrictEqual(ERROR);

  res = post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: registrationData[3].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInviteResponse3 = JSON.parse(String(res.body));
  expect(channelInviteResponse2).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInviteResponse4 = JSON.parse(String(res.body));
  expect(channelInviteResponse2).toStrictEqual(ERROR);

  // NOTE NEED TO REMOVE TEST FOR INT TOKEN SINCE TOKEN IS STRING//
});

test('Testing for invalid channel', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
    { email: 'user4@bar.com', password: '123456', nameFirst: 'first4', nameLast: 'last4' },
    { email: 'user6@bar.com', password: '123456', nameFirst: 'first6', nameLast: 'last6' },
  ];
  for (const user of reqisteredUser) {
    const res = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const bodyObj = JSON.parse(String(res.body));
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }

  let res = post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: 0.1,
      uId: 0.1,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite1 = JSON.parse(String(res.body));
  expect(channelInvite1).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: registrationData[1].token,
      channelId: 0.1,
      uId: registrationData[2].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite2 = JSON.parse(String(res.body));
  expect(channelInvite2).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: 0.1,
      uId: registrationData[3].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite3 = JSON.parse(String(res.body));
  expect(channelInvite3).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: 0.1,
      uId: 0.1,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite4 = JSON.parse(String(res.body));
  expect(channelInvite4).toStrictEqual(ERROR);
});

test('Testing for token and uId are same person', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of reqisteredUser) {
    const res = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const bodyObj = JSON.parse(String(res.body));
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }

  let res = post('channel/create/v2', {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(String(res.body));


  res = post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[0].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite1 = JSON.parse(String(res.body));
  expect(channelInvite1).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite2 = JSON.parse(String(res.body));
  expect(channelInvite2).toStrictEqual(ERROR);
  res = post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  });
  expect(res.statusCode).toBe(OK);
  const channelInvite3 = JSON.parse(String(res.body));
  expect(channelInvite3).toStrictEqual(ERROR);
});
