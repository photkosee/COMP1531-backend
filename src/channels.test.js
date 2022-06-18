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
	    const owner_pete = channelsListallV1(authUserId_1.authUserId);
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
	    const channelId_1 = channelsCreateV1(authUserId_1.authUserId, 'pete', false);
	    const channelId_2 = channelsCreateV1(authUserId_2.authUserId, 'jay', true);
	    const channelId_3 = channelsCreateV1(authUserId_3.authUserId, 'jay', true);
	    const owner_pete = channelsListallV1(authUserId_1.authUserId);
	    const owner_jay = channelsListallV1(authUserId_2.authUserId);
	    const owner_jay2 = channelsListallV1(authUserId_3.authUserId);
	    const owner_may = channelsListallV1(authUserId_4.authUserId);
	    expect(owner_pete).toStrictEqual({
						channels: [
		                           	  { 
						    channelId: channelId_1.channelId, 
						    channelName: 'pete' 
						  },
						  { 
						    channelId: channelId_2.channelId, 
						    channelName: 'jay' 
						  },
						  { 
						    channelId: channelId_3.channelId, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });
	    expect(owner_jay).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_1.channelId, 
						    channelName: 'pete' 
						  },
						  { 
						    channelId: channelId_2.channelId, 
						    channelName: 'jay' 
						  },
						  { 
						    channelId: channelId_3.channelId, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });  
	    expect(owner_jay2).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_1.channelId, 
						    channelName: 'pete' 
						  },
						  { 
						    channelId: channelId_2.channelId, 
						    channelName: 'jay' 
						  },
						  { 
						    channelId: channelId_3.channelId, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });  
	    expect(owner_may).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_1.channelId, 
						    channelName: 'pete' 
						  },
						  { 
						    channelId: channelId_2.channelId, 
						    channelName: 'jay' 
						  },
						  { 
						    channelId: channelId_3.channelId, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });					                                
	    });
});

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
	    const channelId_1 = channelsCreateV1(authUserId_1.authUserId, 'pete', false);
	    const channelId_2 = channelsCreateV1(authUserId_2.authUserId, 'jay', true);
	    const channelId_3 = channelsCreateV1(authUserId_3.authUserId, 'jay', true);
	    const channelId_5 = channelsCreateV1(authUserId_1.authUserId, 'pete2', true);
	    expect(typeof channelId_1.channelId).toBe('number');
	    const owner_mark = channelsListV1(authUserId_4.authUserId);
	    const owner_pete = channelsListV1(authUserId_1.authUserId);
	    const owner_jay = channelsListV1(authUserId_2.authUserId);
	    const owner_jay2 = channelsListV1(authUserId_3.authUserId);
	    expect(owner_pete).toStrictEqual({
						channels: [
		                           	  { 
						    channelId: channelId_1.channelId, 
						    channelName: 'pete' 
						  },
						  { 
						    channelId: channelId_5.channelId, 
						    channelName: 'pete2' 
						  }
		                                ]  
					   });
	    expect(owner_jay).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_2.channelId, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });  
	    expect(owner_jay2).toStrictEqual({
						channels: [                                  	  
		                           	  { 
						    channelId: channelId_3.channelId, 
						    channelName: 'jay' 
						  }
		                                ]  
					   });
	    expect(owner_mark).toStrictEqual({
						channels: [                                  	  
		                           	  
		                                ]  
					   });                               
	});
});	

describe('Tests for channelsCreateV1', () => {
	test('Testing creating channels', () => {
		clearV1();
		const authUserId_1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
	        const authUserId_2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
	        const authUserId_3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
	        const authUserId_4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');
	        const channelId_1 = channelsCreateV1(authUserId_1.authUserId, 'pete', false);
	        const channelId_2 = channelsCreateV1(authUserId_2.authUserId, 'jay', true);
	        const channelId_3 = channelsCreateV1(authUserId_3.authUserId, 'jay', true);
	        const channelId_5 = channelsCreateV1(authUserId_1.authUserId, 'pete2', true);
		expect(typeof channelId_1).toBe('object');
	        expect(typeof channelId_1.channelId).toBe('number');
		expect(typeof channelId_5.channelId).toBe('number');
		expect(typeof authUserId_1).toBe('object');
		expect(typeof authUserId_1.authUserId).toBe('number');
		const authUserId = authRegisterV1('mal3@gmail.com', '123456', 'first', 'last');
	}); 

	test('Testing error in creating channels by having no names or more than 20 characters', () => {
		clearV1();
		const authUserId = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const channelId_a = channelsCreateV1(authUserId.authUserId, '', true);
		const channelId_b = channelsCreateV1(authUserId.authUserId, '12345678912345678912345', true);
		const channelId_c = channelsCreateV1('', 'name', 'true');
		const channelId_d = channelsCreateV1(authUserId.authUserId, 'name', 'what');
		expect(channelId_a).toStrictEqual({ error: 'error' });
		expect(channelId_b).toStrictEqual({ error: 'error' });
		expect(channelId_c).toStrictEqual({ error: 'error' });
		expect(channelId_d).toStrictEqual({ error: 'error' });
	}); 


});
