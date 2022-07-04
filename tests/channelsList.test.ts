import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };
  
beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with unexisting token - channels/list/v2', () => {  
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
    const channel = JSON.parse(res2.getBody() as string);
    let channelId = channel.channelId;

    let res3 = request('GET', `${url}:${port}/channels/list/v2`, { 
      qs: {
        token: 12345
      }
    });
    const channelList = JSON.parse(res3.getBody() as string);
    expect(channelList).toStrictEqual(ERROR);
  })
});

describe('Testing listing no channels - channels/list/v2', () => {  
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

    let res3 = request('GET', `${url}:${port}/channels/list/v2`, { 
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res3.getBody() as string);
    expect(channelList).toStrictEqual({ channels: [] });
  })
});

describe('Testing listing channels - channels/list/v2', () => {  
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

    let res2 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
    const channel = JSON.parse(res2.getBody() as string);
    let channelId = channel.channelId;

    let res4 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'LoL',
        isPublic: true
      }
    });
    const channel2 = JSON.parse(res4.getBody() as string);
    let channelId2 = channel.channelId;


    let res3 = request('GET', `${url}:${port}/channels/list/v2`, { 
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res3.getBody() as string);
    expect(channelList).toStrictEqual({ channels: [ {channelId: channelId, 
                                        name: channel.name}, 
                                        {channelId: channelId2, 
                                          name: channel2.name} ] });
  })
});