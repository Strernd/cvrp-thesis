import { Ruin } from './Ruin';
import * as sinon from 'sinon';
import { Solution } from '../../types/Solution';
import { Parameters } from '../../types/Parameters';

sinon.stub(Math, "random").callsFake(() => 0.5);

test("Ruin should remove 2 locations", () => {
    const solution: Solution = {
        tours: [[2, 3], [4, 5]],
        loads: [20, 20],
        cost: 100,
        feasible: true
    }
    const parameters: Parameters = {
        ruinSizeMax: 3,
        ruinSizeMin: 1,
        recreateKNearest: 5
    }
    const tested = Ruin.random(solution, parameters);
    expect(tested.removed).toEqual([5, 4]);
    expect(tested.tours).toEqual([[2, 3]]);
})