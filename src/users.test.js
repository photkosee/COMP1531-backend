import { authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js';
import { clearV1 } from './other.js';

const ERROR = {error: 'error'};

beforeEach(() => {
    clearV1();
});


describe('Tests for userProfileV1', () => {

    test('Valid user and authorised user', () => {

        let authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        authUserId = authUserId.authUserId;

        let userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');
        userId = userId.authUserId;

        expect(userProfileV1(authUserId, userId)).toStrictEqual({   
            user: {
                uId: userId,
                email: 'user@gmail.com',
                nameFirst: 'User',
                nameLast: 'Last',
                handleStr: expect.any(String),
            }
        });

    });


    test('Non-existent  Id', () => {

        let authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        authUserId = authUserId.authUserId; 

        let userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');
        userId = userId.authUserId;

        const dummyUserId = userId + authUserId + authUserId;
        const dummyAuthUserId = authUserId + userId + userId;

        expect(userProfileV1(authUserId, dummyUserId)).toStrictEqual(ERROR);
        expect(userProfileV1(dummyAuthUserId, userId)).toStrictEqual(ERROR);

    });


    test('Invalid  Id', () => {

        const authUserId = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
        const userId = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');

        expect(userProfileV1(authUserId.authUserId, '0')).toStrictEqual(ERROR);
        expect(userProfileV1('0', userId.authUserId)).toStrictEqual(ERROR);
        expect(userProfileV1(authUserId.authUserId, '')).toStrictEqual(ERROR);
        expect(userProfileV1('', userId.authUserId)).toStrictEqual(ERROR);

    });

});
