

import { channelMessagesV1, channelInviteV1, channelJoinV1, channelDetailsV1 } from './channel.js';
import { getData, setData } from './dataStore.js'; 
import { authRegisterV1, authLoginV1 } from './auth.js';
import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';


/*
Invites a user with ID uId to join a channel with ID channelId. 
Once invited, the user is added to the channel immediately. In both public and private channels, 
all members are able to invite users.
  
Parameters: {
    authUserId,
    channelId,
    uId
}
Returns: {
    noError: {}
    error: {error: 'error'}
}

*/

beforeEach(() => {    clearV1();});

describe ('Test cases for channelInviteV1', () => {

    test ('Valid Channel and Valid User Ids', () => {

        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; //in
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; //out
        const authUserId3 = authRegisterV1('user3@bar.com', '123456', 'first3', 'last3').authUserId; //in
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4').authUserId; //in
        const authUserId5 = authRegisterV1('user5@bar.com', '123456', 'first5', 'last5').authUserId; //out
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; //out
        const authUserId7 = authRegisterV1('user7@bar.com', '123456', 'first7', 'last7').authUserId; //out
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8').authUserId; //in
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 
        channelJoinV1(authUserId3, channel1);
        channelJoinV1(authUserId4, channel1);  
        channelJoinV1(authUserId8, channel1);
        expect(channelInviteV1(authUserId1, channel1, authUserId2)).toEqual({}); // in out
        expect(channelInviteV1(authUserId3, channel1, authUserId4)).toEqual({ error: 'error' }) // in in
        expect(channelInviteV1(authUserId5, channel1, authUserId6)).toEqual({ error: 'error' }); // out out
        expect(channelInviteV1(authuserId7, channel1, authuserId8)).toEqual({ error: 'error' }); // out in
        

        
    });

    test ('Valid Channel and Invalid uId', () => {
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; 
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8').authUserId; 
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 
        channelJoinV1(authUserId8, channel1); 
        expect(channelInviteV1(authUserId1, channel1, 0.1)).toEqual({ error: 'error' }); // valid invalid -- in channel
        expect(channelInviteV1(authUserId2, channel1, 0.1)).toEqual({ error: 'error' }); // valid invalid -- not
        expect(channelInviteV1(0.1, channel1, authUserId6)).toEqual({ error: 'error' }); // invalid valid -- not
        expect(channelInviteV1(0.1, channel1, authUserId8)).toEqual({ error: 'error' }); // invalid valid -- in channel
        expect(channelInviteV1(0.1, channel1, 0.1)).toEqual({ error: 'error' }); // invalid invalid

    });

    test ('Invalid Channel', () => {
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4').authUserId; 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6').authUserId; 
        
        expect(channelInviteV1(authUserId1, 0.1, 0.1)).toEqual({ error: 'error' }); // valid invalid 
        expect(channelInviteV1(authUserId2, 0.1, authUserId4)).toEqual({ error: 'error' }); // valid valid 
        expect(channelInviteV1(0.1, 0.1, authUserId6)).toEqual({ error: 'error' }); // invalid valid 
        expect(channelInviteV1(0.1, 0.1, 0.1)).toEqual({ error: 'error' }); // invalid invalid
        //valid valid 

    });
    
    
    test ('uId of authUserId is same as uId invite', () => {
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1').authUserId; 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2').authUserId; 
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true).channelId; 

        expect(channelInviteV1(authUserId1, channel1, authUserId1)).toEqual({ error: 'error' }); // in channel
        expect(channelInviteV1(authUserId2, channel1, authUserId2)).toEqual({ error: 'error' }); // not in channel
        expect(channelInviteV1(0.1,channel1,0.1)).toEqual({ error: 'error' }); 

    });



});