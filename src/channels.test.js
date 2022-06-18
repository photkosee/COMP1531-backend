import { channelsListallV1, channelsListV1, channelsCreateV1 } from './channels'
import { authRegisterV1, authLoginV1 } from './auth.js'
import { clearV1 } from './other';

describe('Tests for channelsCreateV1', () => {
	test('Testing creating channels', () => {
		clearV1();
		const authUserId = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const authUserId2 = authRegisterV1('mal2@gmail.com', '123456', 'first', 'last');
		expect(typeof authUserId).toBe('integer');
		const channelId = channelsCreateV1(authUserId, 'name', 'true');
		const channelId2 = channelsCreateV1(authUserId, 'name', 'true');
		const channelId3 = channelsCreateV1(authUserId2, 'name', 'true');
		expect(typeof channelId).toBe('integer');
		expect(typeof channelId2).toBe('integer');
		expect(typeof channelId3).toBe('integer');
	}); 

	test('Testing error in creating channels by having no names or more than 20 characters', () => {
		clearV1();
		const authUserId = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const channelId_a = channelsCreateV1(authUserId, '', true);
		const channelId_b = channelsCreateV1(authUserId, '12345678912345678912345', true);
		const channelId_c = channelsCreateV1('', 'name', 'true');
		const channelId_d = channelsCreateV1(authUserId2, 'name', 'what');
		expect(channelId_a).toStrictEqual({ error: 'error' });
		expect(channelId_b).toStrictEqual({ error: 'error' });
		expect(channelId_c).toStrictEqual({ error: 'error' });
		expect(channelId_d).toStrictEqual({ error: 'error' });
	}); 
});
