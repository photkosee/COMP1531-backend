import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels'
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1 } from './other';
import validator from 'validator';

test('Testing creating channels', () => {
    clearV1();
    validator.isEmail('mal@gmail.com');
    const authUserId = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
    expect(typeof authUserId).toBe('integer');
    const channelId = channelsCreateV1(authUserId, 'name', 'true');
    expect(typeof channelId).toBe('integer');
}); 

test('Testing error in creating channels by having no names or more than 20 characters', () => {
    clearV1();
    validator.isEmail('mal@gmail.com');
    const authUserId = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
    const channelId_a = channelsCreateV1(authUserId, '', true);
    const channelId_b = channelsCreateV1(authUserId, '12345678912345678912345', true);
    expect(channelId_a).toMatchObject({ error: 'error' });
    expect(channelId_b).toMatchObject({ error: 'error' });
}); 

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

test('Testing listing all channels', () => {
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
    const channelId_3 = channelsCreateV1(authUserId_3, 'may', true);
    const channelId_4 = channelsCreateV1(authUserId_4, 'mark', false);
    const owner_pete = channelsListallV1(authUserId_1);
    const owner_jay = channelsListallV1(authUserId_2);
    expect(owner_pete).toMatchObject({
					channels: [
                                   	  { 
					    channelId: channelId_1, 
					    channelName: 'pete' 
					  },
                                   	  { 
					    channelId: channelId_2, 
					    channelName: 'jay' 
					  },
					  { 
					    channelId: channelId_3, 
					    channelName: 'may' 
					  },
                                   	  { 
					    channelId: channelId_4, 
					    channelName: 'mark' 
					  }
                                        ]  
				   });
    expect(owner_jay).toMatchObject({
					channels: [
                                   	  { 
					    channelId: channelId_1, 
					    channelName: 'pete' 
					  },
                                   	  { 
					    channelId: channelId_2, 
					    channelName: 'jay' 
					  },
					  { 
					    channelId: channelId_3, 
					    channelName: 'may' 
					  },
                                   	  { 
					    channelId: channelId_4, 
					    channelName: 'mark' 
					  }
                                        ]  
				   });                        
});
