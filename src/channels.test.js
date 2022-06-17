import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels'
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1 } from './other';


describe('Tests for channelsListallV1', () => {

	test('Testing for errors', () => {
	    clearV1();
	    const owner_pete = channelsListallV1('');
	    expect(owner_pete).toStrictEqual({ error: 'error' });
	});
	
	test('Testing listing empty channels', () => {
	    clearV1();
	    const authUserId_1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
	    const owner_pete = channelsListallV1(authUserId_1);
	    expect(owner_pete).toStrictEqual({
						channels: [
		                           	  
		                                ]  
					   });
	});
	
	test('Testing listing all channels', () => {
	    clearV1();
	    const authUserId_1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
	    const authUserId_2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
	    const authUserId_3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
	    const authUserId_4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');
	    const channelId_1 = channelsCreateV1(authUserId_1, 'pete', false);
	    const channelId_2 = channelsCreateV1(authUserId_2, 'jay', true);
	    const channelId_3 = channelsCreateV1(authUserId_3, 'jay', true);
	    const owner_pete = channelsListallV1(authUserId_1);
	    const owner_jay = channelsListallV1(authUserId_2);
	    const owner_jay2 = channelsListallV1(authUserId_3);
	    const owner_may = channelsListallV1(authUserId_4);
	    expect(owner_pete).toStrictEqual({
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
						    channelName: 'jay' 
						  }
		                                ]  
					   });
	    expect(owner_jay).toStrictEqual({
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
						    channelName: 'jay' 
						  }
		                                ]  
					   });  
	    expect(owner_jay2).toStrictEqual({
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
						    channelName: 'jay' 
						  }
		                                ]  
					   });  
	    expect(owner_may).toStrictEqual({
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
						    channelName: 'jay' 
						  }
		                                ]  
					   });					                                
	    });
});
