import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels'
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1 } from './other';
import validator from 'validator';

test('Testing listing channels', () => {
    clearV1();
    validator.isEmail('mal@gmail.com');
    validator.isEmail('mal2@gmail.com');
    validator.isEmail('mal3@gmail.com');
    validator.isEmail('mal4@gmail.com');
    const authUserId_1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
    const authUserId_2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
    const authUserId_3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
    const authUserId_4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');
    const channelId_1 = channelsCreateV1(authUserId_1, 'pete', false);
    const channelId_2 = channelsCreateV1(authUserId_2, 'jay', true);
    const channelId_3 = channelsCreateV1(authUserId_3, 'jay', true);
    const channelId_4 = channelsCreateV1(authUserId_4, 'mark', false);
    const owner_pete = channelsListV1(authUserId_1);
    const owner_jay = channelsListV1(authUserId_2);
    const owner_jay2 = channelsListV1(authUserId_3);
    expect(owner_pete).toMatchObject({
					channels: [
                                   	  { 
					    channelId: channelId_1, 
					    channelName: 'pete' 
					  }
                                        ]  
				   });
    expect(owner_jay).toMatchObject({
					channels: [                                  	  
                                   	  { 
					    channelId: channelId_2, 
					    channelName: 'jay' 
					  }
                                        ]  
				   });  
    expect(owner_jay2).toMatchObject({
					channels: [                                  	  
                                   	  { 
					    channelId: channelId_3, 
					    channelName: 'jay' 
					  }
                                        ]  
				   });                               
});
