import { partialReverse } from "./KOpt";

test('Middle of the array should be reversed', () => {
    const input = [0,1,2,3,4,5,6,0]
    const tested = partialReverse(input, 2, 6);
    const expected = [0,1,5,4,3,2,6,0];
    expect(tested).toEqual(expected);
});

test('Array should be reversed to the middle', () => {
    const input = [0,1,2,3,4,5,6,0]
    const tested = partialReverse(input, 0, 3);
    const expected = [2,1,0,3,4,5,6,0];
    expect(tested).toEqual(expected);
});


test('Array should be reversed from the middle to the end', () => {
    const input = [0,1,2,3,4,5,6,0]
    const tested = partialReverse(input, 4, 8);
    const expected = [0,1,2,3,0,6,5,4];
    expect(tested).toEqual(expected);
});


test('Whole Array should be reversed', () => {
    const input = [0,1,2,3,4,5,6,0]
    const tested = partialReverse(input, 0, 8);
    const expected = [0,6,5,4,3,2,1,0];
    expect(tested).toEqual(expected);
});