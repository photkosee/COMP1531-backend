import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };
  
beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with wrong typeof parameter - channels/create/v2', () => {  
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
        token: 1,
        name: 'DOTA2',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    expect(channel).toStrictEqual(ERROR);

    let res3 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 12345,
        isPublic: false
      }
    });
    const channel2 = JSON.parse(res.getBody() as string);
    expect(channel2).toStrictEqual(ERROR);

    let res4 = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: 123
      }
    });
    const channel3 = JSON.parse(res.getBody() as string);
    expect(channel3).toStrictEqual(ERROR);

  });

  describe('Testing for name length - channels/create/v2', () => {   
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
          name: '',
          isPublic: false
        }
      });
      const channel = JSON.parse(res.getBody() as string);
      expect(channel).toStrictEqual(ERROR);

      let res3 = request('POST', `${url}:${port}/channels/create/v2`, { 
        json: {
          token: token,
          name: '1234567891011121314151617',
          isPublic: false
        }
      });
      const channel2 = JSON.parse(res.getBody() as string);
      expect(channel2).toStrictEqual(ERROR);
    })
  })
});

describe('Succesfully creating channels - channels/create/v2', () => {
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

    res = request('POST', `${url}:${port}/channels/create/v2`, { 
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: true
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    expect(channel).toStrictEqual({ channelId: expect.any(number)});
  })
});
