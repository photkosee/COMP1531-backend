import {
	channelsListallV1,
	channelsListV1,
	channelsCreateV1
} from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

const ERROR = {error: 'error'};

beforeEach(() => {
	clearV1();
});


describe('Tests for channelsListallV1', () => {

	test('Testing for errors', () => {

		const ownerPete = channelsListallV1('');
		expect(ownerPete).toStrictEqual(ERROR);

	});


	test('Testing listing empty channels', () => {

		const authUserId1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const ownerPete = channelsListallV1(authUserId1.authUserId);

		expect(ownerPete).toStrictEqual({
			channels: []
		});

	});


	test('Testing listing all channels', () => {

		const authUserId1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const authUserId2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
		const authUserId3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
		const authUserId4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');

		const channelId1 = channelsCreateV1(authUserId1.authUserId, 'pete', false);
		const channelId2 = channelsCreateV1(authUserId2.authUserId, 'jay', true);
		const channelId3 = channelsCreateV1(authUserId3.authUserId, 'jay', true);

		const ownerPete = channelsListallV1(authUserId1.authUserId);
		const ownerJay = channelsListallV1(authUserId2.authUserId);
		const ownerJay2 = channelsListallV1(authUserId3.authUserId);
		const ownerMay = channelsListallV1(authUserId4.authUserId);

		expect(ownerPete).toStrictEqual({
			channels: [
				{
					channelId: channelId1.channelId,
					name: 'pete'
				},
				{
					channelId: channelId2.channelId,
					name: 'jay'
				},
				{
					channelId: channelId3.channelId,
					name: 'jay'
				}
			]
		});

		expect(ownerJay).toStrictEqual({
			channels: [
				{
					channelId: channelId1.channelId,
					name: 'pete'
				},
				{
					channelId: channelId2.channelId,
					name: 'jay'
				},
				{
					channelId: channelId3.channelId,
					name: 'jay'
				}
			]
		});

		expect(ownerJay2).toStrictEqual({
			channels: [
				{
					channelId: channelId1.channelId,
					name: 'pete'
				},
				{
					channelId: channelId2.channelId,
					name: 'jay'
				},
				{
					channelId: channelId3.channelId,
					name: 'jay'
				}
			]
		});

		expect(ownerMay).toStrictEqual({
			channels: [
				{
					channelId: channelId1.channelId,
					name: 'pete'
				},
				{
					channelId: channelId2.channelId,
					name: 'jay'
				},
				{
					channelId: channelId3.channelId,
					name: 'jay'
				}
			]
		});

	});

});


describe('Tests for channelsListV1', () => {

	test('Testing errors', () => {

		const ownerPete = channelsListV1('');
		expect(ownerPete).toStrictEqual(ERROR);

	});


	test('Testing listing channels', () => {

		const authUserId1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const authUserId2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
		const authUserId3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
		const authUserId4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');

		const channelId1 = channelsCreateV1(authUserId1.authUserId, 'pete', false);
		const channelId2 = channelsCreateV1(authUserId2.authUserId, 'jay', true);
		const channelId3 = channelsCreateV1(authUserId3.authUserId, 'jay', true);
		const channelId5 = channelsCreateV1(authUserId1.authUserId, 'pete2', true);

		expect(typeof channelId1.channelId).toBe('number');

		const owner_mark = channelsListV1(authUserId4.authUserId);
		const ownerPete = channelsListV1(authUserId1.authUserId);
		const ownerJay = channelsListV1(authUserId2.authUserId);
		const ownerJay2 = channelsListV1(authUserId3.authUserId);

		expect(ownerPete).toStrictEqual({
			channels: [
				{
					channelId: channelId1.channelId,
					name: 'pete'
				},
				{
					channelId: channelId5.channelId,
					name: 'pete2'
				}
			]
		});

		expect(ownerJay).toStrictEqual({
			channels: [
				{
					channelId: channelId2.channelId,
					name: 'jay'
				}
			]
		});

		expect(ownerJay2).toStrictEqual({
			channels: [
				{
					channelId: channelId3.channelId,
					name: 'jay'
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

		const authUserId1 = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');
		const authUserId2 = authRegisterV1('mal2@gmail.com', '123456', 'first2', 'last2');
		const authUserId3 = authRegisterV1('mal3@gmail.com', '123456', 'first3', 'last3');
		const authUserId4 = authRegisterV1('mal4@gmail.com', '123456', 'first4', 'last4');

		const channelId1 = channelsCreateV1(authUserId1.authUserId, 'pete', false);
		const channelId2 = channelsCreateV1(authUserId2.authUserId, 'jay', true);
		const channelId3 = channelsCreateV1(authUserId3.authUserId, 'jay', true);
		const channelId5 = channelsCreateV1(authUserId1.authUserId, 'pete2', true);
		
		expect(typeof channelId1).toBe('object');
		expect(typeof channelId1.channelId).toBe('number');
		expect(typeof channelId5.channelId).toBe('number');
		expect(typeof authUserId1).toBe('object');
		expect(typeof authUserId1.authUserId).toBe('number');

	});


	test('Testing error in creating channels by having no names or more than 20 characters', () => {

		const authUserId = authRegisterV1('mal@gmail.com', '123456', 'first', 'last');

		const channelIdA = channelsCreateV1(authUserId.authUserId, '', true);
		const channelIdB = channelsCreateV1(authUserId.authUserId, '12345678912345678912345', true);
		const channelIdC = channelsCreateV1('', 'name', 'true');
		const channelIdD = channelsCreateV1(authUserId.authUserId, 'name', 'what');

		expect(channelIdA).toStrictEqual(ERROR);
		expect(channelIdB).toStrictEqual(ERROR);
		expect(channelIdC).toStrictEqual(ERROR);
		expect(channelIdD).toStrictEqual(ERROR);

	});

});
