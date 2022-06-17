import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels'
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1 } from './other';

describe('Tests for channelsListV1', () => {

	test('Testing errors', () => {
  	    clearV1();
  	    const owner_pete = channelsListV1('');	
  	    expect(owner_pete).toStrictEqual({ error: 'error' });	
	});
	
	test('Testing listing channels', () => {
	    clearV1();
	    const authUserId_1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
	    const authUserId_2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
	    const authUserId_3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
	    const authUserId_4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');
	    const channelId_1 = channelsCreateV1(authUserId_1, 'pete', false);
	    const channelId_2 = channelsCreateV1(authUserId_2, 'jay', true);
	    const channelId_3 = channelsCreateV1(authUserId_3, 'jay', true);
	    const channelId_4 = channelsCreateV1(authUserId_4, 'mark', false);
	    const channelId_5 = channelsCreateV1(authUserId_1, 'pete2', true);
	    const owner_may = channelsListV1(authUserId_4);
	    const owner_pete = channelsListV1(authUserId_1);
	    const owner_jay = channelsListV1(authUserId_2);
	    const owner_jay2 = channelsListV1(authUserId_3);
	    expect(owner_may).toStrictEqual({
						channels: [                                  	  
		                           	  
		                                ]  
					   });
	    expect(owner_pete).toStrictEqual({
						channels: [
		                           	  { 
						    channelId: channelId_1, 
						    channelName: 'pete' 
						  },
						  { 
						    channelId: channelId_5, 
						    channelName: 'pete2' 
						  }
		                                ]  
					   });
	    expect(owner_jay).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_2, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });  
	    expect(owner_jay2).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_3, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });                               
	});
});
