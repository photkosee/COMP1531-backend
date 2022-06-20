// Jacinta 15 June 2020
// channelDetailsV1 Jest tests

import { channelJoinV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';

describe ('Test cases for channelJoinV1', () => {

    test ('Valid User Id and Valid Channel Id', () => {
        clearV1();
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toEqual({});

    });

    test('Non-existent Ids', () => {
        clearV1();
        
        let userId1 = authRegisterV1('mal1@email.com', 'one', 'One', 'Number');
        userletId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', 'two', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        let dummyChannelId = channelId + '1';
        let dummyUserId = userId1 + userId2;

        expect(channelJoinV1(userId2, dummyChannelId)).toEqual({error: 'error'});
        expect(channelJoinV1(dummyUserId, channelId)).toEqual({error: 'error'});
    });

    test('Invalid Ids', () => {
        clearV1();
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, '0')).toEqual({error: 'error'});
        expect(channelJoinV1('0', channelId)).toEqual({error: 'error'});

    });

    test('Authorised user is already a member', () => {
        clearV1();
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        channelJoinV1(userId2, channelId);

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'}); // Already owner + member
        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'}); // Already member

    });

    test('channelId refers to a private channel and authorised user is not already a member', () => {
        clearV1();

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'});

    });

    test('channelId refers to a private channel and authorised user is already a member', () => {
        clearV1();

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'});
    });
});

describe('Tests for channelDetailsV1', () => {
    test ('Valid userId and Valid channelId', () => {
        
        clearV1();

        let authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        authUserId1 = authUserId1.authUserId;

        let channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelDetailsV1(authUserId1, channelId)).toMatchObject(
            {
            'name': 'FO9A_CRUNCHIE',
            'isPublic': false,
            'ownerMembers': [ 1 ],
            'allMembers': [ 1 ],
            }
        );
    });

    test.skip('Testing if member but not owner', () => {

        clearV1();

        let authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        authUserId1 = authUserId1.authUserId;
        let authUserId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        authUserId2 = authUserId2.authUserId;

        let channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;
        channelJoinV1(authUserId2, channelId); 

        expect(channelDetailsV1(authUserId2, channelId)).toMatchObject(        
            {
            'name': 'FO9A_CRUNCHIE',
            'isPublic': false,
            'ownerMembers': [ 1 ],
            'allMembers': [ 1, 2 ],
            }
        ); 
    });


    test ('Return error tests', () => {
        clearV1();

        const authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const authUserId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const authUserId3 = authRegisterV1('mal3@email.com', '1234567', 'Three', 'Number');

        const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
        channelJoinV1(authUserId2, channelId);

        const dummyUserId = authUserId1 + authUserId2 + authUserId3;
        const dummyChannelId = channelId + '1';
        
        expect(channelDetailsV1(dummyUserId, channelId)).toMatchObject({error: 'error'}); // non-existent userId and valid channelId
        expect(channelDetailsV1(authUserId1, dummyChannelId)).toMatchObject({error: 'error'}); // valid userId and non-existent channelId

        expect(channelDetailsV1('abc', channelId)).toMatchObject({error: 'error'}); // invalid userId and valid channelId
        expect(channelDetailsV1(authUserId1, 'abc')).toMatchObject({error: 'error'}); // valid userId and invalid channelId

        expect(channelDetailsV1(authUserId3, channelId)).toMatchObject({error: 'error'}); // valid userId but not member
>>>>>>> master
    });

});
