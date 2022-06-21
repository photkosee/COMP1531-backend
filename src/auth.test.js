import { clearV1 } from './other.js';
import { authRegisterV1, authLoginV1 } from './auth.js';
import { userProfileV1 } from './users.js';

const ERROR = {error: 'error'};

beforeEach(() => {
    clearV1();
});


describe('Tests Cases for authRegisterV1', () => {
    
    test('Testing for empty field values', () => {
        
        const user1 = authRegisterV1('mridul@gmail.com', '', '', '');
        const user2 = authRegisterV1('', 'jshdbfgjb43@#', '', '');
        const user3 = authRegisterV1('', '', 'Mridul', '');
        const user4 = authRegisterV1('', '', '', 'Singh');
        const user5 = authRegisterV1('', '', '', '');
        const user6 = authRegisterV1('mridul@gmail.com', '          ', 'Mridul Anand', 'Singh');

        expect(user1).toStrictEqual(ERROR);
        expect(user2).toStrictEqual(ERROR);
        expect(user3).toStrictEqual(ERROR);
        expect(user4).toStrictEqual(ERROR);
        expect(user5).toStrictEqual(ERROR);
        expect(user6).toStrictEqual(ERROR);

    });


    test('Testing with wrong typeof parameter', () => {
        
        const user1 = authRegisterV1(239592837568, 'ksbdfwej78323', 'Mridul', 'Singh');
        const user2 = authRegisterV1('mridul@mail.com', 283647687678, 'Mridul', 'Singh');
        const user3 = authRegisterV1('mriduls@gmail.com', 'ksjdf^kd&$gu3', true, 'Singh');
        const user4 = authRegisterV1('mridula@gmail.com', 'skjgik7864%^%', 'Mridul', false);
        const user5 = authRegisterV1('mridu@gmail.com', 'skjjdfkik7864%^%', 93769956, 'Singh');
        const user6 = authRegisterV1('mrila@gmail.com', 'skjgik7isug864%^%', 'Mridul', 9283459);

        expect(user1).toStrictEqual(ERROR);
        expect(user2).toStrictEqual(ERROR);
        expect(user3).toStrictEqual(ERROR);
        expect(user4).toStrictEqual(ERROR);
        expect(user5).toStrictEqual(ERROR);
        expect(user6).toStrictEqual(ERROR);

    });


    test('Testing for same email entered', () => {

        authRegisterV1('mridul@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        const user = authRegisterV1('mridul@gmail.com', 'as@1w4#As', 'Mridul Anand', 'Singh');

        expect(user).toStrictEqual(ERROR);

    });


    test('Testing for wrong email format', () => {
        
        const user1 = authRegisterV1('@gmail.com', 'Mas@1234#As', 'Mridul', 'Singh');
        const user2 = authRegisterV1('likemail.com', 'lis@1sg34#As', 'like', 'rome');
        const user3 = authRegisterV1('jhon-@gmail.com', 'skfkn@234#As', 'jhon', 'dene');
        const user4 = authRegisterV1('ali..saund@mail.com', 'Mskdbg$234#As', 'ali', 'saund');
        const user5 = authRegisterV1('.saurab@mail.com', 'sauussf244#As', 'saurabh', 'gurjar');
        const user6 = authRegisterV1('jack#node@mail.com', 'denodsd@234#As', 'jack', 'node');
        const user7 = authRegisterV1('den_ode@unsw#mail.com', 'sgrz#34#As', 'denode', 'issac');
        const user8 = authRegisterV1('arther@mail..com', 'Mas@1qegf$#As', 'arther', 'zefri');
        const user9 = authRegisterV1('donald tram@gmail.com', 'Mas@1qegf$#As', 'donald', 'tram');

        expect(user1).toStrictEqual(ERROR);
        expect(user2).toStrictEqual(ERROR);
        expect(user3).toStrictEqual(ERROR);
        expect(user4).toStrictEqual(ERROR);
        expect(user5).toStrictEqual(ERROR);
        expect(user6).toStrictEqual(ERROR);
        expect(user7).toStrictEqual(ERROR);
        expect(user8).toStrictEqual(ERROR);
        expect(user9).toStrictEqual(ERROR);

    });


    test('Testing if all emails are unique', () => {
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1234#As', 'Mridul', 'Singh');
        const user2 = authRegisterV1('mridul907@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        const user3 = authRegisterV1('mriduls@gmail.com', 'Mwrhas@34#As', 'Mridul', 'Singh');

        expect(user1).toStrictEqual({authUserId: 1});
        expect(user2).toStrictEqual({authUserId: 2});
        expect(user3).toStrictEqual({authUserId: 3});

    });


    test('Testing for password length', () => {
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1', 'Mridul', 'Singh');
        const user2 = authRegisterV1('like1@mail.com', '', 'like', 'rome');
        const user3 = authRegisterV1('jhon-dene@gmail.com', 's', 'jhon', 'dene');
        const user4 = authRegisterV1('ali.saund@mail.com', '4#Assd', 'ali', 'saund');

        expect(user1).toStrictEqual(ERROR);
        expect(user2).toStrictEqual(ERROR);
        expect(user3).toStrictEqual(ERROR);
        expect(user4).toStrictEqual({authUserId: 1});

    });


    test('Testing for valid name limit', () => {
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1skldbjk', 'Mridul', '');
        const user2 = authRegisterV1('like1@mail.com', 'ksnjdgji%#$#', '', 'rome');
        const user3 = authRegisterV1('jhon-dene@gmail.com', 'kalsehgfiu$%$', ' ', 'dene');
        const user4 = authRegisterV1('ali.saund@mail.com', '29248hjahdfh', 'ali', ' ');
        const user5 = authRegisterV1('arther@mail..com', 'Mas@1qegf$#As', 'artherkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush', 'zefri');
        const user6 = authRegisterV1('zafri.jake@mail..com', 'Mas@1qegf$#As', 'jake', 'zafrirkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush');

        expect(user1).toStrictEqual(ERROR);
        expect(user2).toStrictEqual(ERROR);
        expect(user3).toStrictEqual(ERROR);
        expect(user4).toStrictEqual(ERROR);
        expect(user5).toStrictEqual(ERROR);
        expect(user6).toStrictEqual(ERROR);

    });


    test('Testing for same name registration', () => {
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1skldbjk', 'Mridul', 'Singh');
        const user2 = authRegisterV1('mriduls@mail.com', 'ksnjdgji%#$#', 'Mridul', 'Singh');
        const user3 = authRegisterV1('singhmridul@gmail.com', 'kalsehgfiu$%$', 'Mridul', 'Singh');
        const user4 = authRegisterV1('mridul907@mail.com', '29248hjahdfh', 'Mridul', 'Singh');

        expect(user1).toStrictEqual({authUserId: 1});
        expect(user2).toStrictEqual({authUserId: 2});
        expect(user3).toStrictEqual({authUserId: 3});
        expect(user4).toStrictEqual({authUserId: 4});

    });


    test('Testing for handleStr', () => {
        
        const user1 = authRegisterV1('mridul@gmail.com', 'Mas@1skldbjk', 'Mridul', 'Singh');
        const user2 = authRegisterV1('mriduls@mail.com', 'ksnjdgji%#$#', 'Mridul', 'Singh');
        const user3 = authRegisterV1('mridula@mail.com', 'ksnjdgji%#$#', 'Mridul', 'Singh');
        const user4 = authRegisterV1('mrid@mail.com', 'ksnjdgji%#$#', 'Mrid*&^*ul', 'Si^^&ngh0979');
        const user5 = authRegisterV1('mridsdula@mail.com', 'ksnjdgji%#$#', 'mRikjsfkbg87645kbsfDul', 'SinH0284');
        const user6 = authRegisterV1('mridsfdvula@mail.com', 'ksnjdgji%#$#', 'mRikjsfkbg87645kbsfDul', 'SinH0284');

        const result1 = userProfileV1(user1.authUserId, user1.authUserId);
        const result2 = userProfileV1(user2.authUserId, user2.authUserId);
        const result3 = userProfileV1(user3.authUserId, user3.authUserId);
        const result4 = userProfileV1(user4.authUserId, user4.authUserId);
        const result5 = userProfileV1(user5.authUserId, user5.authUserId);
        const result6 = userProfileV1(user6.authUserId, user6.authUserId);
        
        expect(result1.user.handleStr).toStrictEqual('mridulsingh');
        expect(result2.user.handleStr).toStrictEqual('mridulsingh0');
        expect(result3.user.handleStr).toStrictEqual('mridulsingh1');
        expect(result4.user.handleStr).toStrictEqual('mridulsingh0979');
        expect(result5.user.handleStr).toStrictEqual('mrikjsfkbg87645kbsfd');
        expect(result6.user.handleStr).toStrictEqual('mrikjsfkbg87645kbsfd0');

    });

});


describe('Tests Cases for authLoginV1', () => {

    test('Testing with email that does not belong to a existing user', () => {
        
        authRegisterV1('mridul@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        authRegisterV1('anand.dev@gmail.com', 'egas@12234#As', 'Anand', 'Dev');

        const login1 = authLoginV1("singh@unsw.edu.au", "egas@12234#As");
        const login2 = authLoginV1("", "wg12234#rgds");
        const login3 = authLoginV1(" ", "ewgas@122Aass");
        const login4 = authLoginV1("anand.dev@gmail.com ", "egas@12wert5");
        const login5 = authLoginV1("anand dev@gmail.com", "egas@12wert5");
        const login6 = authLoginV1(" anand.dev@gmail.com", "egas@12wert5");

        expect(login1).toStrictEqual(ERROR);
        expect(login2).toStrictEqual(ERROR);
        expect(login3).toStrictEqual(ERROR);
        expect(login4).toStrictEqual(ERROR);
        expect(login5).toStrictEqual(ERROR);
        expect(login6).toStrictEqual(ERROR);

    });


    test('Testing with invalid password but valid email', () => {
        
        authRegisterV1('mridul@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        authRegisterV1('anand.dev@gmail.com', 'bhdb#945bjkdvb', 'Anand', 'Dev');

        const login1 = authLoginV1("mridul@gmail.com", "egas@ 12234#As");
        const login2 = authLoginV1("mridul@gmail.com", "egas@12234#As ");
        const login3 = authLoginV1("anand.dev@gmail.com", " bhdb#945bjkdvb");
        const login4 = authLoginV1("anand.dev@gmail.com", "kawjwrgi83746");

        expect(login1).toStrictEqual(ERROR);
        expect(login2).toStrictEqual(ERROR);
        expect(login3).toStrictEqual(ERROR);
        expect(login4).toStrictEqual(ERROR);
        
    });


    test('Testing with both valid email and password', () => {
        
        authRegisterV1('mridul@gmail.com', 'egas@12234#As', 'Mridul', 'Singh');
        authRegisterV1('anand.dev@gmail.com', 'bhdb#945bjkdvb', 'Anand', 'Dev');

        const login1 = authLoginV1("mridul@gmail.com", "egas@12234#As");
        const login2 = authLoginV1("anand.dev@gmail.com", "bhdb#945bjkdvb");

        expect(login1).toStrictEqual({authUserId: 1});
        expect(login2).toStrictEqual({authUserId: 2});
    });
    
});
