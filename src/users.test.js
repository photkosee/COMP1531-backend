// Jacinta 15 June 2022
// Test for userProfileV1

import { authRegisterV1 } from './auth.js';
import { userProfileV1 } from './userProfileV1.js';
import { clearV1 } from './other.js';

describe('Tests for userProfileV1', () => {

    test('Valid user and authorised user', () => {
        clearV1();

        const authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        const userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');


        expect(userProfileV1(authUserId,userId)).toMatchObject(
            {
                'authUserId': userId,
                'nameFirst': 'User',
                'nameLast': 'Last',
                'email': 'user@gmail.com',
                'password': 'password',
            }
        );
    });

    test('Non-existent  Id', () => {
        clearV1();

        const authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        const userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');

        const dummyUserId = userId + authUserId + authUserId;
        const dummyAuthUserId = authUserId + userId + userId;

        expect(userProfileV1(authUserId, dummyUserId)).toMatchObject({error: 'error'});
        expect(userProfileV1(dummyAuthUserId, userId)).toMatchObject({error: 'error'});
    });

    test('Invalid  Id', () => {
        clearV1();

        const authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        const userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');

        expect(userProfileV1(authUserId, '0')).toMatchObject({error: 'error'});
        expect(userProfileV1('0', userId)).toMatchObject({error: 'error'});
    });
});
