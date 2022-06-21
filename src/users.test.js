// Jacinta 15 June 2022
// Test for userProfileV1

import { authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js';
import { clearV1 } from './other.js';

describe('Tests for userProfileV1', () => {

    test('Valid user and authorised user', () => {
        clearV1();

        let authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        authUserId = authUserId.authUserId;
        let userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');
        userId = userId.authUserId;


        expect(userProfileV1(authUserId, userId)).toEqual(
            {   
                uId: userId,
                email: 'user@gmail.com',
                nameFirst: 'User',
                nameLast: 'Last',
                handleStr: expect.any(String),
            }
        );
    });

    test('Non-existent  Id', () => {
        clearV1();

        let authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        authUserId = authUserId.authUserId;        
        let userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');
        userId = userId.authUserId;
        const dummyUserId = userId + authUserId + authUserId;
        const dummyAuthUserId = authUserId + userId + userId;

        expect(userProfileV1(authUserId, dummyUserId)).toMatchObject({error: 'error'});
        expect(userProfileV1(dummyAuthUserId, userId)).toMatchObject({error: 'error'});
    });

    test('Invalid  Id', () => {
        clearV1();

        const authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        const userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');

        expect(userProfileV1(authUserId.authUserId, '0')).toMatchObject({error: 'error'});
        expect(userProfileV1('0', userId.authUserId)).toMatchObject({error: 'error'});
        expect(userProfileV1(authUserId.authUserId, '')).toMatchObject({error: 'error'});
        expect(userProfileV1('', userId.authUserId)).toMatchObject({error: 'error'});
    });
});
