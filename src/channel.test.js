
import { channelMessagesV1, channelInviteV1, channelJoinV1, channelDetailsV1 } from './channel.js';
import { getData, setData } from './dataStore.js'; 
import { authRegisterV1, authLoginV1 } from './auth.js';
import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels.js';
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

beforeEach(() => {    clearV1();});


describe ('Test cases for channelMessagesV1', () => {

    test ('invalid channel', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        expect(channelMessagesV1(userId1, 0.1, 0)).toEqual({ error: 'error' });
        expect(channelMessagesV1(0.1, 0.1, 0)).toEqual({ error: 'error'});
    });

    test ('start is invalid (greater than no. messages) (start<0)', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true).channelId; 
        const channel2 = channelsCreateV1(userId2, 'channel2', true);
        

        expect(channelMessagesV1(userId1, channel1, 0.1)).toEqual({ error: 'error' }); //start < 0
        
        expect(channelMessagesV1(userId2,channel2.channelId, 2).messages.length).toBeGreaterThanOrEqual(start); // start > no. msg

        

    });

    test ('check no. of messages in return is correct', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true);
        
        expect(channelMessagesV1(userId1, channel1.channelId, 0).start).toEqual(0);
        expect(channelMessagesV1(userId1, channel1.channelId, 0).end).toLessThanOrEqual(50);
        expect(channelMessagesV1(userId1, channel1.channelId, 0).messages.length).toLessThanOrEqual(50);

    })
    

    test ('authUserId not in channel or invalid', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId;
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId;
        const channel1 = channelsCreateV1(userId1, 'channel1', true);

        expect(channelMessagesV1(userId2, channel1.channelId, 0)).toEqual({ error: 'error' }); //not in channel
        expect(channelMessagesV1(0.1, channel1.channelId, 0)).toEqual({ error: 'error' }); //invalid uId
    });

    
});