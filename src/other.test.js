import { clearV1 } from './other';

test('Test clearV1 return type', () => {

    const result = clearV1();
    expect(typeof result).toStrictEqual('object');

});


test('Test clearV1 return data', () => {

    const result = clearV1();
    expect(result).toStrictEqual({});

});