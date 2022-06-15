import { clearV1 } from './other';
import { authRegisterV1 } from './auth';

describe('Tests Cases for authRegisterV1', () => {
    
    test('Testing for empty field values', () => {
        clearV1();
        
        const user1 = authRegisterV1('mridul@gmail.com', '', '', '');
        const user2 = authRegisterV1('', 'jshdbfgjb43@#', '', '');
        const user3 = authRegisterV1('', '', 'Mridul', '');
        const user4 = authRegisterV1('', '', '', 'Singh');
        const user5 = authRegisterV1('', '', '', '');

        expect(user1).toMatchObject({error: 'error'});
        expect(user2).toMatchObject({error: 'error'});
        expect(user3).toMatchObject({error: 'error'});
        expect(user4).toMatchObject({error: 'error'});
        expect(user5).toMatchObject({error: 'error'});

    });


    test('Testing for same email entered', () => {
        clearV1();

        authRegisterV1('mridul@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        const user = authRegisterV1('mridul@gmail.com', 'as@1w4#As', 'Mridul Anand', 'Singh');

        expect(user).toMatchObject({error: 'error'});
    });


    test('Testing for wrong email format', () => {
        clearV1();
        
        const user1 = authRegisterV1('@gmail.com', 'Mas@1234#As', 'Mridul', 'Singh');
        const user2 = authRegisterV1('likemail.com', 'lis@1sg34#As', 'like', 'rome');
        const user3 = authRegisterV1('jhon-@gmail.com', 'skfkn@234#As', 'jhon', 'dene');
        const user4 = authRegisterV1('ali..saund@mail.com', 'Mskdbg$234#As', 'ali', 'saund');
        const user5 = authRegisterV1('.saurab@mail.com', 'sauussf244#As', 'saurabh', 'gurjar');
        const user6 = authRegisterV1('jack#node@mail.com', 'denodsd@234#As', 'jack', 'node');
        const user7 = authRegisterV1('denode@unsw#mail.com', 'sgrz#34#As', 'denode', 'issac');
        const user8 = authRegisterV1('arther@mail..com', 'Mas@1qegf$#As', 'arther', 'zefri');
        const user9 = authRegisterV1('donald tram@gmail.com', 'Mas@1qegf$#As', 'donald', 'tram');

        expect(user1).toMatchObject({error: 'error'});
        expect(user2).toMatchObject({error: 'error'});
        expect(user3).toMatchObject({error: 'error'});
        expect(user4).toMatchObject({error: 'error'});
        expect(user5).toMatchObject({error: 'error'});
        expect(user6).toMatchObject({error: 'error'});
        expect(user7).toMatchObject({error: 'error'});
        expect(user8).toMatchObject({error: 'error'});
        expect(user9).toMatchObject({error: 'error'});

    });


    test('Testing if all emails are unique', () => {
        clearV1();
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1234#As', 'Mridul', 'Singh');
        const user2 = authRegisterV1('mridul907@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        const user3 = authRegisterV1('mriduls@gmail.com', 'Mwrhas@34#As', 'Mridul', 'Singh');

        expect(user1).toMatchObject({authUserId: 1 });
        expect(user2).toMatchObject({authUserId: 2 });
        expect(user3).toMatchObject({authUserId: 3 });

    });


    test('Testing for password length', () => {
        clearV1();
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1', 'Mridul', 'Singh');
        const user2 = authRegisterV1('like1@mail.com', '', 'like', 'rome');
        const user3 = authRegisterV1('jhon-dene@gmail.com', 's', 'jhon', 'dene');
        const user4 = authRegisterV1('ali.saund@mail.com', '4#Assd', 'ali', 'saund');

        expect(user1).toMatchObject({error: 'error'});
        expect(user2).toMatchObject({error: 'error'});
        expect(user3).toMatchObject({error: 'error'});
        expect(user4).toMatchObject({authUserId: 4 });

    });


    test('Testing for valid name limit', () => {
        clearV1();
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1skldbjk', 'Mridul', '');
        const user2 = authRegisterV1('like1@mail.com', 'ksnjdgji%#$#', '', 'rome');
        const user3 = authRegisterV1('jhon-dene@gmail.com', 'kalsehgfiu$%$', ' ', 'dene');
        const user4 = authRegisterV1('ali.saund@mail.com', '29248hjahdfh', 'ali', ' ');
        const user5 = authRegisterV1('arther@mail..com', 'Mas@1qegf$#As', 'artherkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush', 'zefri');
        const user6 = authRegisterV1('zafri.jake@mail..com', 'Mas@1qegf$#As', 'jake', 'zafrirkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush');

        expect(user1).toMatchObject({error: 'error'});
        expect(user2).toMatchObject({error: 'error'});
        expect(user3).toMatchObject({error: 'error'});
        expect(user4).toMatchObject({error: 'error'});
        expect(user5).toMatchObject({error: 'error'});
        expect(user6).toMatchObject({error: 'error'});

    });


    test('Testing for same name registration', () => {
        clearV1();
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1skldbjk', 'Mridul', 'Singh');
        const user2 = authRegisterV1('mriduls@mail.com', 'ksnjdgji%#$#', 'Mridul', 'Singh');
        const user3 = authRegisterV1('singhmridul@gmail.com', 'kalsehgfiu$%$', 'Mridul', 'Singh');
        const user4 = authRegisterV1('mridul907@mail.com', '29248hjahdfh', 'Mridul', 'Singh');

        expect(user1).toMatchObject({authUserId: 1 });
        expect(user2).toMatchObject({authUserId: 2 });
        expect(user3).toMatchObject({authUserId: 3 });
        expect(user4).toMatchObject({authUserId: 4 });

    });

});
