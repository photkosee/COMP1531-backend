// Jacinta 15 June 2020
// channelDetailsV1 Jest tests

import { channelMessagesV1, channelInviteV1, channelJoinV1, channelDetailsV1 } from './channel.js';
import { getData, setData } from './dataStore.js'; 
import { authRegisterV1, authLoginV1 } from './auth.js';
import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';


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

    // Users 1 and 3
    const authUserId1 = authRegisterV1('z1111@gmail.com', 'one', 'One', 'Number');
    const authUserId3 = authRegisterV1('z3333', 'three', 'Three', 'Number');

    // Create channel FO9A_CRUNCHIE
    const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
    channelJoinV1(authUserId3, channelId);
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