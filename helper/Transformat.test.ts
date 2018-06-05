import { Tour } from "../types/Tour";
import { Transformator } from "./Transformator";

test('Tour should give edges', () => {
    const tour: Tour[] = [[1, 2, 3], [4, 5, 6]];
    const tested = Transformator.locationsToEdges(tour);
    const expected = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 5], [5, 6], [6, 0]];
    expect(tested).toEqual(expected);
});