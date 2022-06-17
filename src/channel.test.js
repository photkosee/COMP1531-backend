// Jacinta 15 June 2022
// Test code for channelJoinV1

import { channelJoinV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';

describe ('Test cases for channelJoinV1', () => {

    test ('Valid User Id and Valid Channel Id', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);

        expect(channelJoinV1(userId2, channelId)).toEqual({});

    });

    test('Non-existent Ids', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@email.com', 'one', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@email.com', 'two', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        const dummyChannelId = channelId + '1';
        const dummyUserId = userId1 + userId2;

        expect(channelJoinV1(userId2, dummyChannelId)).toEqual({error: 'error'});
        expect(channelJoinV1(dummyUserId, channelId)).toEqual({error: 'error'});
    });

    test('Invalid Ids', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);

        expect(channelJoinV1(userId2, '0')).toEqual({error: 'error'});
        expect(channelJoinV1('0', channelId)).toEqual({error: 'error'});

    });

    test('Authorised user is already a member', () => {
        clearV1();
        
        const userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelJoinV1(userId2, channelId);

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'}); // Already owner + member
        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'}); // Already member

    });

    test('channelId refers to a private channel and authorised user is not already a member', () => {
        clearV1();

        const userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);

        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'});

    });

    test('channelId refers to a private channel and authorised user is already a member', () => {
        clearV1();

        const userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);

        expect(channelJoinV1(userId1, channelId)).toEqual({});

    });

});
