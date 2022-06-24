import {
    channelInviteV1,
    channelMessagesV1,
    channelJoinV1,
    channelDetailsV1
} from '../src/channel.js';
import { authRegisterV1 } from '../src/auth.js';
import { channelsCreateV1 } from '../src/channels.js';
import { clearV1 } from '../src/other.js';
import { userProfileV1 } from '../src/users.js'; 

const ERROR = {error: 'error'};

beforeEach(() => {
    clearV1();
});


describe ('Test cases for channelJoinV1', () => {

    test('Valid User Id and Valid Channel Id', () => {
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toStrictEqual({});

    });


    test('Non-existent Ids', () => {
        
        let userId1 = authRegisterV1('mal1@email.com', 'one', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', 'two', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        let dummyChannelId = channelId + '1';
        let dummyUserId = userId1 + userId2;

        expect(channelJoinV1(userId2, dummyChannelId)).toStrictEqual(ERROR);
        expect(channelJoinV1(dummyUserId, channelId)).toStrictEqual(ERROR);

    });


    test('Invalid Ids', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, '0')).toStrictEqual(ERROR);
        expect(channelJoinV1('0', channelId)).toStrictEqual(ERROR);

    });


    test('Authorised user is already a member', () => {
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        channelJoinV1(userId2, channelId);

        expect(channelJoinV1(userId1, channelId)).toStrictEqual(ERROR);
        expect(channelJoinV1(userId2, channelId)).toStrictEqual(ERROR);

    });


    test('Private channel and adding global owner who is already a member', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toStrictEqual(ERROR);

    });


    test('Private channel and adding not a global owner', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toStrictEqual(ERROR);

    });


    test('Return empty object if private but adding global owner', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;

        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;

        let channelId = channelsCreateV1(userId2, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toStrictEqual({});

    });

});


describe ('Test cases for channelMessagesV1', () => {
    test('invalid input', () => {
        expect(channelMessagesV1('string', 'string', 'string')).toStrictEqual(ERROR);
        expect(channelMessagesV1(true, false, 1)).toStrictEqual(ERROR); 
        const object = {number: 1};
        expect(channelMessagesV1(object, object, 1)).toStrictEqual(ERROR); 

    });
    test('invalid channel', () => {
        expect(channelMessagesV1(1,2,3)).toStrictEqual(ERROR); 
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;

        expect(channelMessagesV1(userId1, 0.1, 0)).toStrictEqual(ERROR);
        expect(channelMessagesV1(0.1, 0.1, 0)).toStrictEqual(ERROR);

    });


    test('start is invalid (greater than no. messages) (start<0)', () => {

        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;

        const channel1 = channelsCreateV1(userId1, 'channel1', true).channelId; 
        const channel2 = channelsCreateV1(userId2, 'channel2', true).channelId;
        
        expect(channelMessagesV1(userId1, channel1, 0.1)).toStrictEqual(ERROR);
        expect(channelMessagesV1(userId1,channel1, -1)).toStrictEqual(ERROR);
        expect(channelMessagesV1(userId2,channel2, 2)).toStrictEqual(ERROR);

    });


    test('check no. of messages in return is correct', () => {

        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true);
        
        expect(channelMessagesV1(userId1, channel1.channelId, 0).start).toStrictEqual(0);
        expect(channelMessagesV1(userId1, channel1.channelId, 0).end).toStrictEqual(-1);
        expect(channelMessagesV1(userId1, channel1.channelId, 0).messages.length).toStrictEqual(0);

    });
    

    test('authUserId not in channel or invalid', () => {

        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true);

        expect(channelMessagesV1(userId2, channel1.channelId, 0)).toStrictEqual(ERROR);
        expect(channelMessagesV1(0.1, channel1.channelId, 0)).toStrictEqual(ERROR);

    });

});


describe('Tests for channelDetailsV1', () => {

    test('Valid userId and Valid channelId', () => {

        let authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        authUserId1 = authUserId1.authUserId;

        let channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelDetailsV1(authUserId1, channelId)).toStrictEqual({
            'name': 'FO9A_CRUNCHIE',
            'isPublic': false,
            'ownerMembers': [{
                uId: authUserId1,
                email: 'mal1@email.com',
                nameFirst: 'One',
                nameLast: 'Number',
                handleStr: 'onenumber'
            }],
            'allMembers': [{
                uId: authUserId1,
                email: 'mal1@email.com',
                nameFirst: 'One',
                nameLast: 'Number',
                handleStr: 'onenumber'
            }],
        });
        
    });


    test('Testing if member but not owner', () => {

        let authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        authUserId1 = authUserId1.authUserId;

        let authUserId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        authUserId2 = authUserId2.authUserId;

        let channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        channelJoinV1(authUserId2, channelId); 

        expect(channelDetailsV1(authUserId2, channelId)).toStrictEqual({
            'name': 'FO9A_CRUNCHIE',
            'isPublic': true,
            'ownerMembers': [{ 
                uId: authUserId1,
                email: 'mal1@email.com',
                nameFirst: 'One',
                nameLast: 'Number',
                handleStr: 'onenumber'
            }],
            'allMembers': [{
                uId: authUserId1,
                email: 'mal1@email.com',
                nameFirst: 'One',
                nameLast: 'Number',
                handleStr: 'onenumber'
            },
            {
                uId: authUserId2,
                email: 'mal2@email.com',
                nameFirst: 'Two',
                nameLast: 'Number',
                handleStr: 'twonumber'
            }],
        });

    });


    test ('Return error tests', () => {

        const authUserId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        const authUserId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        const authUserId3 = authRegisterV1('mal3@email.com', '1234567', 'Three', 'Number');

        const channelId = channelsCreateV1(authUserId1, 'FO9A_CRUNCHIE', false);
        channelJoinV1(authUserId2, channelId);

        const dummyUserId = authUserId1 + authUserId2 + authUserId3;
        const dummyChannelId = channelId + '1';
        
        expect(channelDetailsV1(dummyUserId, channelId)).toStrictEqual(ERROR);
        expect(channelDetailsV1(authUserId1, dummyChannelId)).toStrictEqual(ERROR);

        expect(channelDetailsV1('abc', channelId)).toStrictEqual(ERROR);
        expect(channelDetailsV1(authUserId1, 'abc')).toStrictEqual(ERROR);

        expect(channelDetailsV1(authUserId3, channelId)).toStrictEqual(ERROR);

    });

});


describe ('Test cases for channelInviteV1', () => {

    test ('Valid Channel and Valid User Ids', () => {
        expect(channelInviteV1(1,2,3)).toStrictEqual(ERROR); 
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const authUserId3 = authRegisterV1('user3@bar.com', '123456', 'first3', 'last3').authUserId;
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4').authUserId;
        const authUserId5 = authRegisterV1('user5@bar.com', '123456', 'first5', 'last5').authUserId;
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId;
        const authUserId7 = authRegisterV1('user7@bar.com', '123456', 'first7', 'last7').authUserId;
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8').authUserId;

        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 
        expect(channelInviteV1(authUserId1, channel1, authUserId2)).toStrictEqual({});
        expect(channelDetailsV1(authUserId1, channel1).allMembers.length).toStrictEqual(2);
        expect(channelDetailsV1(authUserId1, channel1).allMembers).toContainEqual(userProfileV1(authUserId2, authUserId2).user); 
        expect(channelDetailsV1(authUserId1, channel1).allMembers).toContainEqual(userProfileV1(authUserId1, authUserId1).user); 

        channelJoinV1(authUserId3, channel1);
        channelJoinV1(authUserId4, channel1);  
        channelJoinV1(authUserId8, channel1);
        expect(channelDetailsV1(authUserId1, channel1).allMembers.length).toStrictEqual(5);
        
        expect(channelInviteV1(authUserId3, channel1, authUserId4)).toStrictEqual(ERROR);
        expect(channelInviteV1(authUserId5, channel1, authUserId6)).toStrictEqual(ERROR);
        expect(channelInviteV1(authUserId7, channel1, authUserId8)).toStrictEqual(ERROR);
        expect(channelDetailsV1(authUserId1, channel1).allMembers.length).toStrictEqual(5);
    });


    test ('Valid Channel and Invalid uId', () => {

        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; 
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8').authUserId; 

        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 

        channelJoinV1(authUserId8, channel1); 

        expect(channelInviteV1(authUserId1, channel1, 0.1)).toStrictEqual(ERROR);
        expect(channelInviteV1(authUserId2, channel1, 0.1)).toStrictEqual(ERROR);
        expect(channelInviteV1(0.1, channel1, authUserId6)).toStrictEqual(ERROR);
        expect(channelInviteV1(0.1, channel1, authUserId8)).toStrictEqual(ERROR);
        expect(channelInviteV1(0.1, channel1, 0.1)).toStrictEqual(ERROR);

    });


    test ('Invalid Channel', () => {

        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4').authUserId; 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; 
        
        expect(channelInviteV1(authUserId1, 0.1, 0.1)).toStrictEqual(ERROR);
        expect(channelInviteV1(authUserId2, 0.1, authUserId4)).toStrictEqual(ERROR);  
        expect(channelInviteV1(0.1, 0.1, authUserId6)).toStrictEqual(ERROR);
        expect(channelInviteV1(0.1, 0.1, 0.1)).toStrictEqual(ERROR);

    });
    
    
    test ('uId of authUserId is same as uId invite', () => {

        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
         
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 

        expect(channelInviteV1(authUserId1, channel1, authUserId1)).toStrictEqual(ERROR);
        expect(channelInviteV1(authUserId2, channel1, authUserId2)).toStrictEqual(ERROR);
        expect(channelInviteV1(0.1,channel1,0.1)).toStrictEqual(ERROR); 

    });

});

