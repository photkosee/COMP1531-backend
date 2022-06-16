

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
describe ('Test cases for channelInviteV1', () => {

    test ('Valid Channel and Valid User Ids', () => {
        clearV1();

        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1'); //in
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2'); //out
        const authUserId3 = authRegisterV1('user3@bar.com', '123456', 'first3', 'last3'); //in
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4'); //in
        const authUserId5 = authRegisterV1('user5@bar.com', '123456', 'first5', 'last5'); //out
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6'); //out
        const authUserId7 = authRegisterV1('user7@bar.com', '123456', 'first7', 'last7'); //out
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8'); //in
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true); 
        channelJoinV1(authUserId3, channel1);
        channelJoinV1(authUserId4, channel1);  
        channelJoinV1(authUserId8, channel1);
        expect(channelInviteV1(authUserId1, channel1, authUserId2)).toMatchObject({}); // in out
        expect(channelInviteV1(authUserId3, channel1, authUserId4)).toMatchObject({ error: 'error' }) // in in
        expect(channelInviteV1(authUserId5, channel1, authUserId6)).toMatchObject({ error: 'error' }); // out out
        expect(channelInviteV1(authuserId7, channel1, authuserId8)).toMatchObject({ error: 'error' }); // out in
        

        
    });

    test ('Valid Channel and Invalid uId', () => {
        clearV1(); 
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1'); 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2'); 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6'); 
        const authUserId8 = authRegisterV1('user8@bar.com', '123456', 'first8', 'last8'); 
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true); 
        channelJoinV1(authUserId8, channel1); 
        expect(channelInviteV1(authUserId1, channel1, -1)).toMatchObject({ error: 'error' }); // valid invalid -- in channel
        expect(channelInviteV1(authUserId2, channel1, -1)).toMatchObject({ error: 'error' }); // valid invalid -- not
        expect(channelInviteV1(-1, channel1, authUserId6)).toMatchObject({ error: 'error' }); // invalid valid -- not
        expect(channelInviteV1(-1, channel1, authUserId8)).toMatchObject({ error: 'error' }); // invalid valid -- in channel
        expect(channelInviteV1(-1, channel1, -1)).toMatchObject({ error: 'error' }); // invalid invalid

    });

    test ('Invalid Channel', () => {
        clearV1(); 
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1'); 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2'); 
        const authUserId4 = authRegisterV1('user4@bar.com', '123456', 'first4', 'last4'); 
        const authUserId6 = authRegisterV1('user6@bar.com', '123456', 'first6', 'last6'); 
        
        expect(channelInviteV1(authUserId1, -1, -1)).toMatchObject({ error: 'error' }); // valid invalid 
        expect(channelInviteV1(authUserId2, -1, authUserId4)).toMatchObject({ error: 'error' }); // valid valid 
        expect(channelInviteV1(-1, -1, authUserId6)).toMatchObject({ error: 'error' }); // invalid valid 
        expect(channelInviteV1(-1, -1, -1)).toMatchObject({ error: 'error' }); // invalid invalid
        //valid valid 

    });
    
    
    test ('uId of authUserId is same as uId invite', () => {
        clearV1();
        const authUserId1 = authRegisterV1('user1@bar.com', '123456', 'first1', 'last1'); 
        const authUserId2 = authRegisterV1('user2@bar.com', '123456', 'first2', 'last2'); 
        const channel1 = channelsCreateV1(authUserId1, 'channel1', true); 

        expect(channelInviteV1(authUserId1, channel1, authUserId1)).toMatchObject({ error: 'error' }); // in channel
        expect(channelInviteV1(authUserId2, channel1, authUserId2)).toMatchObject({ error: 'error' }); // not in channel


    });


    //test for private and public? 

});