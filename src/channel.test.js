// Jacinta 15 June 2020
// channelDetailsV1 Jest tests

import { channelJoinV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';


test ('channelDetailsV1: valid userId and valid channelId', () => {
    
    clearV1();

    const authUserId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
    const authUserId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
    const authUserId3 = authRegisterV1('mal3@', 'three', 'Three', 'Number');

    const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
    channelJoinV1(authUserId2, channelId);

    expect(channelDetailsV1(authUserId1, channelId)).toMatchObject(
        {
        'name': 'FO9A_CRUNCHIE',
        'isPublic': false,
        'ownerMembers': [ 1 ],
        'allMembers': [ 1, 2 ],
        }
    ); // user is owner, valid channelId

    expect(channelDetailsV1(authUserId2, channelId)).toMatchObject(        
        {
        'name': 'FO9A_CRUNCHIE',
        'isPublic': false,
        'ownerMembers': [ 1 ],
        'allMembers': [ 1, 2 ],
        }
    ); // user is member but not owner, valid channelId

});

test ('channelDetailsV1: return error tests', () => {
    clearV1();

    const authUserId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
    const authUserId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
    const authUserId3 = authRegisterV1('mal3@', 'three', 'Three', 'Number');

    const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
    channelJoinV1(authUserId2, channelId);
    
    expect(channelDetailsV1(9, channelId)).toMatchObject({error: 'error'}); // non-existent userId and valid channelId
    expect(channelDetailsV1(authUserId1, 99)).toMatchObject({error: 'error'}); // valid userId and non-existent channelId

    expect(channelDetailsV1('abc', channelId)).toMatchObject({error: 'error'}); // invalid userId and valid channelId
    expect(channelDetailsV1(authUserId1, 'abc')).toMatchObject({error: 'error'}); // valid userId and invalid channelId

    expect(channelDetailsV1(authUserId3, channelId)).toMatchObject({error: 'error'}); // valid userId but not member
});


