// Jacinta 15 June 2020
// channelDetailsV1 Jest tests

import { channelDetailsV1 } from './channel.js';
import { getData, setData } from './dataStore'; 
import { clearV1 } from './other';


test ('channelDetailsV1: valid userId and valid channelId', () => {
    clearAndSetData();

    const dataExpected = expectValid();

    expect(channelDetailsV1(1, 10)).toMatchObject(dataExpected);
});

test ('channelDetailsV1: valid userId and non-existent channelId', () => {
    clearAndSetData();

    const dataExpected = expectError();

    expect(channelDetailsV1(1, 99)).toMatchObject(dataExpected);
});

test ('channelDetailsV1: non-existent userId and valid channelId', () => {
    clearAndSetData();

    const dataExpected = expectError();

    expect(channelDetailsV1(9, 10)).toMatchObject(dataExpected);
});

test ('channelDetailsV1: invalid userId and valid channelId', () => {
    clearAndSetData();

    const dataExpected = expectError();

    expect(channelDetailsV1('abc', 10)).toMatchObject(dataExpected);
});

test ('channelDetailsV1: valid userId and invalid channelId', () => {
    clearAndSetData();

    const dataExpected = expectError();

    expect(channelDetailsV1(1, 'abc')).toMatchObject(dataExpected);
});

test ('channelDetailsV1: valid userId but not member', () => {
    clearAndSetData();

    const dataExpected = expectError();

    expect(channelDetailsV1(3, 10)).toMatchObject(dataExpected);
});

function clearAndSetData() {

    clearV1();

    const data = {
        'users': [
            {
                'authUserId': 1,
            },
            {
                'autherUserId': 3,
            }
        ],
        'channels': [
            {
                'channel_id': 10,
                'name': 'F09A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1, 2 ],
            },
        ],
    };
    setData(data);

}


function expectValid() {
    return {
        'name': 'FO9A_CRUNCHIE',
        'isPublic': false,
        'ownerMembers': [ 1 ],
        'allMembers': [ 1, 2 ],
    }
}

function expectError() {
    return {
        error: 'error',
    }
}