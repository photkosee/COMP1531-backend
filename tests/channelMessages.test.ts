import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
	request('DELETE', `${url}:${port}/clear/v1`);
});

const channelMessages = (token, channelId, start) => {
	const res = request(
		'GET',
		`${url}:${port}/channel/messages/v2`, 
		{
			qs: {
				token: JSON.stringify(token),
				channelId: JSON.stringify(channelId),
				start: JSON.stringify(start),
			}
		}	
	)
	const bodyObj = JSON.parse(String(res.getBody()));
	return bodyObj; 
}


test('Testing for invalid input type', () => {
	expect(channelMessages('string','string','string')).toStrictEqual(ERROR);
	expect(channelMessages(true, false, 1)).toStrictEqual(ERROR);
	const object = { number: 1 };
	expect(channelMessages(object, object, object)).toStrictEqual(ERROR);
});
test('Testing for invalid channelId', () => {
	expect(channelMessages(1, 2, 3)).toStrictEqual(ERROR);
	const user1 = request('POST', `${url}:${port}/auth/register/v2`, {
		json: {
			email: 'user1@bar.com',
			password: '123456',
			nameFirst: 'first1',
			nameLast: 'last1',
		}
	});
	expect(channelMessages(user1.token, 0.1, 0)).toStrictEqual(ERROR);
	expect(channelMessages(0.1, 0.1, 0)).toStrictEqual(ERROR);
})
test('Testing for invalid start parameter', () => {
	const user1 = request('POST', `${url}:${port}/auth/register/v2`, {
		json: {
			email: 'user1@bar.com',
			password: '123456',
			nameFirst: 'first1',
			nameLast: 'last1',
		}
	});
	const channel1 = request('POST', `${url}:${post}/channels/create/v2`, {
		json: {
			token: user1.token,
			name: 'channel1',
			isPublic: true,
		}
	});

	expect(channelMessages(user1.token, channel1.channelId, 0.1)).toStrictEqual(ERROR);
	expect(channelMessages(user1.token, channel1.channelId, -1)).toStrictEqual(ERROR);
	expect(channelMessages(user1.token, channel1.channelId, 2)).toStrictEqual(ERROR);

});
test('Testing for correct no. messages return', () => {
	const user1 = request('POST', `${url}:${port}/auth/register/v2`, {
		json: {
			email: 'user1@bar.com',
			password: '123456',
			nameFirst: 'first1',
			nameLast: 'last1',
		}
	});
	const channel1 = request('POST', `${url}:${post}/channels/create/v2`, {
		json: {
			token: user1.token,
			name: 'channel1',
			isPublic: true,
		}
	});
	expect(channelMessages(user1.token, channel1.channelId, 0).start).toStrictEqual(0);
	expect(channelMessages(user1.token, channel1.channelId, 0).end).toStrictEqual(-1);
	expect(channelMessages(user1.token, channel1.channelId, 0).messages.length).toStrictEqual(0);
});
test('Testing for token not in channel or invalid', () => {
	const user1 = request('POST', `${url}:${port}/auth/register/v2`, {
		json: {
			email: 'user1@bar.com',
			password: '123456',
			nameFirst: 'first1',
			nameLast: 'last1',
		}
	});
	const user2 = request('POST', `${url}:${port}/auth/register/v2`, {
		json: {
			email: 'user2@bar.com',
			password: '123456',
			nameFirst: 'first2',
			nameLast: 'last2',
		}
	});
	const channel1 = request('POST', `${url}:${post}/channels/create/v2`, {
		json: {
			token: user1.token,
			name: 'channel1',
			isPublic: true,
		}
	});

	expect(channelMessages(user2.token, channel1.channelId, 0)).toStrictEqual(ERROR);
	expect(channelMessages(0.1, channel1.channelId, 0)).toStrictEqual(ERROR);
});