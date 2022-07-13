
import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };


beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

const channelLeave = (token: string, channelId: number) => {
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
        json: {
            token: token,
            channelId: channelId,
        }
    })
    const bodyObj = JSON.parse(res.body as string);
    return bodyObj;
}

test('Testing for invalid input in channel/leave/v1', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user1@email.com',
            password: 'password1',
            nameFirst: 'john',
            nameLast: 'smith',
        }
    })
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user2@email.com',
            password: 'password2',
            nameFirst: 'ben',
            nameLast: 'mitchel',
        }
    })
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/channels/create/v2`, {
        json: {
            token: user1.token,
            name: 'channel1',
            isPublic: true,
        }
    })
    const channel1 = JSON.parse(res.body as string);
    expect(channelLeave(user1.token, 0.1)).toStrictEqual(ERROR);
    expect(channelLeave('randomString', 0.1)).toStrictEqual(ERROR);
    expect(channelLeave(user1.token, 0.1)).toStrictEqual(ERROR);
})


test('Testing for token not in channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user1@email.com',
            password: 'password1',
            nameFirst: 'john',
            nameLast: 'smith',
        }
    })
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user2@email.com',
            password: 'password2',
            nameFirst: 'ben',
            nameLast: 'mitchel',
        }
    })
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/channels/create/v2`, {
        json: {
            token: user1.token,
            name: 'channel1',
            isPublic: true,
        }
    })
    const channel1 = JSON.parse(res.body as string);
    expect(channelLeave(user2.token, 0.1)).toStrictEqual(ERROR);
    expect(channelLeave(user2.token, channel1.channelId)).toStrictEqual(ERROR);
})

test('Testing for successful leave', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user1@email.com',
            password: 'password1',
            nameFirst: 'john',
            nameLast: 'smith',
        }
    })
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user2@email.com',
            password: 'password2',
            nameFirst: 'ben',
            nameLast: 'mitchel',
        }
    })
    const user2 = JSON.parse(res.body as string);    
    res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user3@email.com',
            password: 'password3',
            nameFirst: 'ajax',
            nameLast: 'virn',
        }
    })
    const user3 = JSON.parse(res.body as string);    
    res = request('POST', `${url}:${port}/channels/create/v2`, {
        json: {
            token: user1.token,
            name: 'channel1',
            isPublic: true,
        }
    })
    const channel1 = JSON.parse(res.body as string);
    request('POST', `${url}:${port}/channel/join/v2`, {
        json: {
            token: user2.token,
            channelId: channel1.channelId,
        }
    });
    request('POST', `${url}:${port}/channel/join/v2`, {
        json: {
            token: user3.token,
            channelId: channel1.channelId,
        }
    });

    res = request('GET', `${url}:${port}/channel/details/v2`, {
        qs: {
            token: user1.token,
            channelId: channel1.channelId,
        }
    })
    let channel1Details = JSON.parse(res.body as string);
    expect(channel1Details.allMembers.length).toStrictEqual(3);
    expect(channel1Details.ownerMembers.length).toStrictEqual(1);


    expect(channelLeave(user3.token, channel1.channelId)).toStrictEqual({});
    expect(channelLeave(user1.token, channel1.channelId)).toStrictEqual({});

    res = request('GET', `${url}:${port}/channel/details/v2`, {
        qs: {
            token: user2.token,
            channelId: channel1.channelId,
        }
    });
    channel1Details = JSON.parse(res.body as string);
    expect(channel1Details.allMembers.length).toStrictEqual(1);
    expect(channel1Details.ownerMembers.length).toStrictEqual(0);

    expect(channelLeave(user2.token, channel1.channelId)).toStrictEqual({});
    
});

test('Last person is owner and leaves', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
            email: 'user1@email.com',
            password: 'password1',
            nameFirst: 'john',
            nameLast: 'smith',
        }
    })
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/channels/create/v2`, {
        json: {
            token: user1.token,
            name: 'channel1',
            isPublic: true,
        }
    })
    const channel1 = JSON.parse(res.body as string);
    expect(channelLeave(user1.token, channel1.channelId)).toStrictEqual({});

})