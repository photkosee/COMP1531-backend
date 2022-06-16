
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


describe ('Test cases for channelMessagesV1', () => {

    test ('invalid channel', () => {
        clearV1();
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1');
        expect(channelMessagesV1(userId1, -1, 0)).toMatchObject({ error: 'error' });
        expect(channelMessagesV1(-1, -1, 0)).toMatchObject({ error: 'error'});
    });

    test ('start is invalid (greater than no. messages) (start<0)', () => {
        const userId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1');
        const userId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2');
        const channel1 = channelsCreateV1(userId1, 'channel1', true); 
        

    });

    test ('authUserId not in channel or invalid', () => {

    });

});