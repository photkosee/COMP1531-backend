// Jacinta 15 June 2022
// Test for userProfileV1

import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

description ('Tests for userProfileV1', () => {

    test('Valid user') {
        clearV1();

        const userId = authRegisterV1('jacinta@gmail.com', 'password', 'Jacinta', 'Chang');

        expect(userProfileV1(userId)).toMatchObject(
            {
                'authUserId': userId,
                'nameFirst': 'Jacinta',
                'nameLast': 'Chang',
                'email': 'jacinta@gmail.com',
                'password': 'password',
            }
        );
    }

    test('Non-existent User Id', () => {
        clearV1();

        const userId = authRegisterV1('jacinta@gmail.com', 'password', 'Jacinta', 'Chang');
        const dummyUserId = userId + 1;

        expect(userProfileV1(dummyUserId)).toMatchObject({error: 'error'});
    });

    test('Invalid User Id', () => {
        clearV1();

        const userId = authRegisterV1('jacinta@gmail.com', 'password', 'Jacinta', 'Chang');

        expect(userProfileV1('0')).toMatchObject({error: 'error'});
    });
});
