import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };


beforeEach(() => {
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
    { email: 'user6@email.com', password: 'password6', nameFirst: 'julu', nameLast: 'idk' },
    { email: 'user7@email.com', password: 'password7', nameFirst: 'hi', nameLast: 'bye' },
    { email: 'user8@email.com', password: 'password8', nameFirst: 'tommorrow', nameLast: 'today' },
  ]
  for (const users of registeredUsers) {
    const res = request('POST',`${url}:${port}/auth/register/v2`, {
      json: {
        email: users.email,
        password: users.password,
        nameFirst: users.nameFirst,
        nameLast: users.nameLast,
      }
    })
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
  })
  expect(res.statusCode).toBe(OK);
  const inviteResponse1 = JSON.parse(res.body as string);
  expect(inviteResponse1).toStrictEqual({});
  
  res = request('GET', `${url}:${port}/channel/details/v2`, {
    qs: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  })
  let channel1Details = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
})