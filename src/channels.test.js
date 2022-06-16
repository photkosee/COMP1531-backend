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
    const channelId2 = channelsCreateV1(authUserId, 'name', 'true');
    expect(typeof channelId).toBe('integer');
    expect(typeof channelId2).toBe('integer');
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