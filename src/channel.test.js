// Jacinta 15 June 2020
// channelDetailsV1 Jest tests

import { channelMessagesV1, channelInviteV1, channelJoinV1, channelDetailsV1 } from './channel.js';
import { getData, setData } from './dataStore.js'; 
import { authRegisterV1, authLoginV1 } from './auth.js';
import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';


test ('channelDetailsV1: valid userId and valid channelId', () => {
    const channelId = clearAndSetData();

    expect(channelDetailsV1(1, channelId)).toMatchObject(
        {
        'name': 'FO9A_CRUNCHIE',
        'isPublic': false,
        'ownerMembers': [ 1 ],
        'allMembers': [ 1, 2 ],
        }
    );
});

test ('channelDetailsV1: valid userId and non-existent channelId', () => {
    const channelId = clearAndSetData();

    expect(channelDetailsV1(1, 99)).toMatchObject({error: 'error'});
});

test ('channelDetailsV1: non-existent userId and valid channelId', () => {
    const channelId = clearAndSetData();

    expect(channelDetailsV1(9, 10)).toMatchObject({error: 'error'});
});

test ('channelDetailsV1: invalid userId and valid channelId', () => {
    const channelId = clearAndSetData();

    expect(channelDetailsV1('abc', 10)).toMatchObject({error: 'error'});
});

test ('channelDetailsV1: valid userId and invalid channelId', () => {
    const channelId = clearAndSetData();

    expect(channelDetailsV1(1, 'abc')).toMatchObject({error: 'error'});
});

test ('channelDetailsV1: valid userId but not member', () => {
    const channelId = clearAndSetData();

    expect(channelDetailsV1(3, 10)).toMatchObject({error: 'error'});
});

function clearAndSetData() {

    clearV1();

    // Users 1, 2 and 3
    const authUserId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
    const authUserId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
    const authUserId3 = authRegisterV1('mal3@', 'three', 'Three', 'Number');

    // Create channel FO9A_CRUNCHIE
    // Admin: User 1
    // Members: User 1, User 2
    const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
    channelJoinV1(authUserId2, channelId);

    return channelId;
}

