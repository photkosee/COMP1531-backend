import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };
  
beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with unexisting token - channels/listall/v2', () => {  
  test('Invalid inputs', () => { 
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    let token = user.token;

    let res2 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    let channelId = channel.channelId;

    let res3 = request('GET', `${url}:${port}/channels/listall/v2`, { 
      qs: {
        token: 12345
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(channelList).toStrictEqual(ERROR);
  })
});

describe('Testing listing no channels - channels/listall/v2', () => {  
  test('Valid inputs', () => { 
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    let token = user.token;

    let res3 = request('GET', `${url}:${port}/channels/listall/v2`, { 
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(channelList).toStrictEqual({ channels: [] });
  })
});

describe('Testing listing channels - channels/listall/v2', () => {  
  test('Valid inputs', () => { 
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    let token = user.token;

    let res6 = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: '2',
        nameLast: '2',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    let token2 = user2.token;

    let res2 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    let channelId = channel.channelId;

    let res4 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'LoL',
        isPublic: true
      }
    });
    const channel2 = JSON.parse(res.getBody() as string);
    let channelId2 = channel2.channelId;

    let res5 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'HoN',
        isPublic: true
      }
    });
    const channel3 = JSON.parse(res.getBody() as string);
    let channelId3 = channel3.channelId;


    let res3 = request('GET', `${url}:${port}/channels/listall/v2`, { 
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);

    let res7 = request('GET', `${url}:${port}/channels/listall/v2`, { 
      qs: {
        token: token2
      }
    });
    const channelList2 = JSON.parse(res.getBody() as string);

    expect(channelList).toStrictEqual(channelList2);
    expect(channelList).toStrictEqual({ channels: [ {channelId: channelId, 
                                        name: channel.name}, 
                                        {channelId: channelId2, 
                                          name: channel2.name}, 
                                          {channelId: channelId3, 
                                            name: channel3.name} ] });
  })
});