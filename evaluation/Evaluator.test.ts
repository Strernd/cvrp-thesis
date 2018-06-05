import { Evaluator } from './Evaluator';
import { Instance } from '../types/Instance';

const instance: Instance = {
    c: 100,
    n: 5,
    depot: 1,
    demand: { 1: 0, 2: 10, 3: 10, 4: 10, 5: 91 },
    distances: {
        1: { 1: 0, 2: 10, 3: 10, 4: 10, 5: 10 },
        2: { 1: 10, 2: 0, 3: 10, 4: 10, 5: 10 },
        3: { 1: 10, 2: 10, 3: 0, 4: 10, 5: 10 },
        4: { 1: 10, 2: 10, 3: 10, 4: 0, 5: 10 },
        5: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 0 },
    }
}

test('tour of 1 should give distances to depot', () => {
    const tested = Evaluator.costSingleTour([2], instance);
    expect(tested).toEqual({ feasible: true, load: 10, cost: 20 });
});

test('multiple tours with one tour over capcaity should return infeasible', () => {
    const tours = [[5, 3], [2]];
    const tested = Evaluator.evaluate(tours, instance);
    expect(tested).toEqual({ tours, feasible: false, loads: [101, 10], overload: 1, cost: 50 });
})