
import { channelMessagesV1, channelJoinV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';

/*

Given a channel with ID channelId that the authorised user is a member of, 
return up to 50 messages between index "start" and "start + 50". 
Message with index 0 is the most recent message in the channel. 
This function returns a new index "end" which is the value of "start + 50", or, 
if this function has returned the least recent messages in the channel, returns -1 in "end" 
to indicate there are no more messages to load after this return.

Parameters: {
    int authUserId,
    int channelId,
    int start
}
Returns: {
    no error: {
        [messages],
        start,
        end
    }
    
    error: { error: 'error' }
}

'messages': [{
  //       'messageId': integer,
  //       'message': 'string',
  //       'authUserId' : integer,
  //       'timeCreated': 'string',
  //     }],
*/

beforeEach(() => {
    clearV1();
});


describe ('Test cases for channelMessagesV1', () => {

    test ('invalid channel', () => {

        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        expect(channelMessagesV1(userId1, 0.1, 0)).toStrictEqual({ error: 'error' });
        expect(channelMessagesV1(0.1, 0.1, 0)).toStrictEqual({ error: 'error'});

    });

    test ('start is invalid (greater than no. messages) (start<0)', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true).channelId; 
        const channel2 = channelsCreateV1(userId2, 'channel2', true).channelId;
        

        expect(channelMessagesV1(userId1, channel1, 0.1)).toStrictEqual({ error: 'error' });
        
        expect(channelMessagesV1(userId2,channel2, 2)).toStrictEqual({ error: 'error' });

    });

    test ('check no. of messages in return is correct', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true);
        
        expect(channelMessagesV1(userId1, channel1.channelId, 0).start).toStrictEqual(0);
        expect(channelMessagesV1(userId1, channel1.channelId, 0).end).toBeLessThanOrEqual(50);
        expect(channelMessagesV1(userId1, channel1.channelId, 0).messages.length).toBeLessThanOrEqual(50);

    });
    

    test ('authUserId not in channel or invalid', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true);

        expect(channelMessagesV1(userId2, channel1.channelId, 0)).toStrictEqual({ error: 'error' });
        expect(channelMessagesV1(0.1, channel1.channelId, 0)).toStrictEqual({ error: 'error' });

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


describe ('Test cases for channelJoinV1', () => {

    test ('Valid User Id and Valid Channel Id', () => {
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toEqual({});

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

        expect(channelJoinV1(userId2, dummyChannelId)).toEqual({error: 'error'});
        expect(channelJoinV1(dummyUserId, channelId)).toEqual({error: 'error'});
    });

    test('Invalid Ids', () => {

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
        
        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', true);
        channelId = channelId.channelId;

        channelJoinV1(userId2, channelId);

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'});
        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'});

    });

    test('Private channel and adding global owner who is already a member', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toEqual({error: 'error'});
    });

    test('Private channel and adding not a global owner', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId1, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId2, channelId)).toEqual({error: 'error'});
    });

    test('Return empty object if private but adding global owner', () => {

        let userId1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
        userId1 = userId1.authUserId;
        let userId2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
        userId2 = userId2.authUserId;
        let channelId = channelsCreateV1(userId2, 'FO9A_CRUNCHIE', false);
        channelId = channelId.channelId;

        expect(channelJoinV1(userId1, channelId)).toEqual({});
    });
});
