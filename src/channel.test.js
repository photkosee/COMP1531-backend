// Jacinta 15 June 2022
// Test code for channelJoinV1

import { channelJoinV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';
import { getData } from './dataStore.js';

describe ('Test cases for channelJoinV1', () => {

    test ('Valid User Id and Valid Channel Id', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);

        expect(channelJoinV1(userId2, channelId)).toBe({});

        // Check to see that userId2 was added to allMembers
        expect(channelDetailsV1(userId1, channelId)).toMatchObject(
            {
                'name': 'FO9A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1, 2 ],
                }
        );
    });

    test('Non-existent Ids', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        const dummyChannelId = channelId + '1';
        const dummyUserId = userId1 + userId2;

        expect(channelJoinV1(userId2, dummyChannelId)).toMatchObject({error: 'error'});
        expect(channelJoinV1(dummyUserId, channelId)).toMatchObject({error: 'error'});

        // Check to see that userId2 was not added to allMembers
        expect(channelDetailsV1(userId1, channelId)).toMatchObject(
            {
                'name': 'FO9A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1 ],
                }
        );
    });

    test('Invalid Ids', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);

        expect(channelJoinV1(userId2, '0')).toMatchObject({error: 'error'});
        expect(channelJoinV1('0', channelId)).toMatchObject({error: 'error'});

        // Check to see that userId2 was not added to allMembers
        expect(channelDetailsV1(userId1, channelId)).toMatchObject(
            {
                'name': 'FO9A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1 ],
                }
        );
    });

    test('Authorised user is already a member', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelJoinV1(userId2, channelId);

        expect(channelJoinV1(userId1, channelId)).toMatchObject({error: 'error'}); // Already owner + member
        expect(channelJoinV1(userId2, channelId)).toMatchObject({error: 'error'}); // Already member

        // Check to see that userId2 and userId were not added twice
        expect(channelDetailsV1(userId1, channelId)).toMatchObject(
            {
                'name': 'FO9A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1, 2 ],
                }
        );
    });

    test('channelId refers to a private channel and authorised user is not already a member', () => {
        clearV1();

        const userId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);

        expect(channelJoinV1(userId2, channelId)).toMatchObject({error: 'error'});

        // Check to see that userId2 was not added to allMembers
        expect(channelDetailsV1(userId1, channelId)).toMatchObject(
            {
                'name': 'FO9A_CRUNCHIE',
                'isPublic': true,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1 ],
                }
        );
    });

    test('channelId refers to a private channel and authorised user is already a member', () => {
        clearV1();

        const userId1 = authRegisterV1('mal1@', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);

        expect(channelJoinV1(userId1, channelId)).toBe({});

        // Check to see that userId1 was not added twice to allMembers
        expect(channelDetailsV1(userId1, channelId)).toMatchObject(
            {
                'name': 'FO9A_CRUNCHIE',
                'isPublic': true,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1 ],
                }
        );
    });

});
