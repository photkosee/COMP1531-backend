import { clearV1 } from './other.js';

test('Test clearV1 return type', () => {

    const result = clearV1();
    expect(typeof result).toStrictEqual('object');

});
