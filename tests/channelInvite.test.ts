import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);


});

const post = (path, body) => {
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
  const bodyObj = JSON.parse(String(res.getBody()));
  return bodyObj;
}


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
  for (const user of registeredUser) {
    const bodyObj = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  };
  
  const channel1 = post('channel/create/v2', {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  })

  const inviteResponse1 = post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  })

  expect(inviteResponse1).toStrictEqual({});

  const channel1Details = request('GET' `${url}:${port}/channel/details/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  })
  const user1Profile = request('GET', `${url}:${port}/user/profile/v2`, {
    json: {
      token: registrationData[0].token,
      uId: registrationData[0].authUserId,
    }
  })
  const user2Profile = request('GET', `${url}:${port}/user/profile/v2`, {
    json: {
      token: registrationData[1].token,
      uId: registrationData[1].authUserId,
    }
  })
  expect(channel1Details.allMembers.length).toStrictEqual(2);
  expect(channel1Details.allMembers).toContainEqual(user1Profile.user);
  expect(channel1Details.allMembers).toContainEqual(user2Profile.user);

  post('channel/join/v2', { 
      token: registrationData[2].token, 
      channelId: channel1.channelId});
  post('channel/join/v2', { 
    token: registrationData[3].token, 
    channelId: channel1.channelId});
  post('channel/join/v2', { 
    token: registrationData[7].token, 
    channelId: channel1.channelId});

  const channel1Details = request('GET', `${url}:${port}/channel/details/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  });
  expect(channel1Details.allMembers.length).toStrictEqual(5);
  
  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[2].token,
      channelId: channel1.channelId,
      uId: registrationData[3].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[4].token,
      channelId: channel1.channelId,
      uId: registrationData[5].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[6].token,
      channelId: channel1.channelId,
      uId: registrationData[7].authUserId,
    }
  })).toStrictEqual(ERROR);

  const channel1Details = request('GET' `${url}:${port}/channel/details/v2`, {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
    }
  });
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
  for (const user of registeredUser) {
    const bodyObj = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  };
  const channel1 = post('channel/create/v2', {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });
  post('channel/join/v2', { 
    token: registrationData[3].token, 
    channelId: channel1.channelId
  });

  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: registrationData[2].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: registrationData[3].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  })).toStrictEqual(ERROR);

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
  for (const user of registeredUser) {
    const bodyObj = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  };

  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: 0.1,
      uId: 0.1,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[1].token,
      channelId: 0.1,
      uId: registrationData[2].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: 0.1,
      uId: registrationData[3].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: 0.1,
      uId: 0.1,
    }
  })).toStrictEqual(ERROR);
});

test('Testing for token and uId are same person', () => {
  const registrationData = [];
  const reqisteredUser = [
    { email: 'user1@bar.com', password: '123456', nameFirst: 'first1', nameLast: 'last1' },
    { email: 'user2@bar.com', password: '123456', nameFirst: 'first2', nameLast: 'last2' },
  ];
  for (const user of registeredUser) {
    const bodyObj = post('auth/register/v2', {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  };

  const channel1 = post('channel/create/v2', {
    json: {
      token: registrationData[0].token,
      name: 'channel1',
      isPublic: true,
    }
  });

  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[0].token,
      channelId: channel1.channelId,
      uId: registrationData[0].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: registrationData[1].token,
      channelId: channel1.channelId,
      uId: registrationData[1].authUserId,
    }
  })).toStrictEqual(ERROR);
  expect(post('channel/invite/v2', {
    json: {
      token: 0.1,
      channelId: channel1.channelId,
      uId: 0.1,
    }
  })).toStrictEqual(ERROR);
  
})
