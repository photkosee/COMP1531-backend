import { clearV1 } from '../src/other.js';

test('Test clearV1 return type', () => {

    const result = clearV1();
    expect(typeof result).toStrictEqual('object');

});
