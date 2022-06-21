

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
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toEqual({});

    });

    test('Non-existent Ids', () => {
        clearV1();
        
        let userId1 = authRegisterV1('mal1@email.com', 'one', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', 'two', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
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
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
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
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        channelJoinV1(userId2, channelId);

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'}); // Already owner + member
        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'}); // Already member

    });

    test('Private channel and adding global owner who is already a member', () => {
        clearV1();

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'});
    });

    test('Private channel and adding not a global owner', () => {
        clearV1();

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'});
    });

    test('Return empty object if private but adding global owner', () => {
        clearV1();

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId2, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toEqual({});
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
            'ownerMembers': [ { uId: authUserId1,
                email: 'mal1@email.com',
               nameFirst: 'One',
               nameLast: 'Number',
               handleStr: 'onenumber' } ],
            'allMembers': [ { uId: authUserId1,
                email: 'mal1@email.com',
               nameFirst: 'One',
               nameLast: 'Number',
               handleStr: 'onenumber' } ],
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
            'ownerMembers': [ { uId: authUserId1,
                email: 'mal1@email.com',
               nameFirst: 'One',
               nameLast: 'Number',
               handleStr: 'onenumber' } ],
            'allMembers': [ { uId: authUserId1,
                email: 'mal1@email.com',
               nameFirst: 'One',
               nameLast: 'Number',
               handleStr: 'onenumber' },
               { uId: authUserId1.authUserId,
                email: 'mal2@email.com',
               nameFirst: 'Two',
               nameLast: 'Number',
               handleStr: 'twonumber' } ],
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
    });

});
import { channelInviteV1, channelJoinV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';

beforeEach(() => {
    clearV1();
});

describe ('Test cases for channelInviteV1', () => {

    test ('Valid Channel and Valid User Ids', () => {

        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const authUserId3 = authRegisterV1('user3@bar.com', '123456', 'first3', 'last3').authUserId;
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4').authUserId;
        const authUserId5 = authRegisterV1('user5@bar.com', '123456', 'first5', 'last5').authUserId;
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId;
        const authUserId7 = authRegisterV1('user7@bar.com', '123456', 'first7', 'last7').authUserId;
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8').authUserId;
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 
        channelJoinV1(authUserId3, channel1);
        channelJoinV1(authUserId4, channel1);  
        channelJoinV1(authUserId8, channel1);
        expect(channelInviteV1(authUserId1, channel1, authUserId2)).toStrictEqual({});
        expect(channelInviteV1(authUserId3, channel1, authUserId4)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(authUserId5, channel1, authUserId6)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(authUserId7, channel1, authUserId8)).toStrictEqual({ error: 'error' });
        
    });

    test ('Valid Channel and Invalid uId', () => {
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; 
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8').authUserId; 
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 
        channelJoinV1(authUserId8, channel1); 
        expect(channelInviteV1(authUserId1, channel1, 0.1)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(authUserId2, channel1, 0.1)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(0.1, channel1, authUserId6)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(0.1, channel1, authUserId8)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(0.1, channel1, 0.1)).toStrictEqual({ error: 'error' });

    });

    test ('Invalid Channel', () => {
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4').authUserId; 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; 
        
        expect(channelInviteV1(authUserId1, 0.1, 0.1)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(authUserId2, 0.1, authUserId4)).toStrictEqual({ error: 'error' });  
        expect(channelInviteV1(0.1, 0.1, authUserId6)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(0.1, 0.1, 0.1)).toStrictEqual({ error: 'error' });

    });
    
    
    test ('uId of authUserId is same as uId invite', () => {
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 

        expect(channelInviteV1(authUserId1, channel1, authUserId1)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(authUserId2, channel1, authUserId2)).toStrictEqual({ error: 'error' });
        expect(channelInviteV1(0.1,channel1,0.1)).toStrictEqual({ error: 'error' }); 

    });

});


describe('Tests for channelDetailsV1', () => {

    test ('Valid userId and Valid channelId', () => {
    
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

        const authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const authUserId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const authUserId3 = authRegisterV1('mal3@email.com', '1234567', 'Three', 'Number');

        const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
        channelJoinV1(authUserId2, channelId);

        const dummyUserId = authUserId1 + authUserId2 + authUserId3;
        const dummyChannelId = channelId + '1';
        
        expect(channelDetailsV1(dummyUserId, channelId)).toMatchObject({error: 'error'});
        expect(channelDetailsV1(authUserId1, dummyChannelId)).toMatchObject({error: 'error'});

        expect(channelDetailsV1('abc', channelId)).toMatchObject({error: 'error'});
        expect(channelDetailsV1(authUserId1, 'abc')).toMatchObject({error: 'error'});

        expect(channelDetailsV1(authUserId3, channelId)).toMatchObject({error: 'error'});
    });

});
