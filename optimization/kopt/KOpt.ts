import { Solution } from "../../types/Solution";
import { ENGINE_METHOD_ALL } from "constants";
import { cloneDeep } from "lodash";
import { Instance } from "../../types/Instance";
import { Evaluator } from "../../evaluation/Evaluator";

export namespace KOpt {
    export function twoOpt(solution: Solution, instance: Instance): Solution {
        let improvement = true;
        while (improvement) {
            let costBefore = solution.cost;
            solution = twoOptAllCombinations(solution, instance);
            if (solution.cost >= costBefore) improvement = false;
        }
        return solution;
    }

    function twoOptAllCombinations(solution: Solution, instance: Instance): Solution {
        const tours = cloneDeep(solution.tours);
        tours.forEach((tour, tidx) => {
            for (let a = 0; a <= tour.length - 1; a++) {
                for (let b = a + 1; b <= tour.length; b++) {
                    const newSolution = twoOptStep(solution, instance, tidx, a, b);
                    if (newSolution.cost < solution.cost) {
                        solution = newSolution;
                        return newSolution;
                    }
                }
            }
        });
        return solution;
    }

    export function randomTwoOpt(solution: Solution, instance: Instance, repeat: number): Solution {
        for (let i = 0; i < repeat; i++) {
            const tours = cloneDeep(solution.tours);
            const tourIdx = randInt(0, tours.length - 1);
            const tour = tours[tourIdx];
            let a = randInt(0, tour.length - 1);
            let b = randInt(0, tour.length);
            if (b < a) [a, b] = [b, a];
            const newSolution = twoOptStep(solution, instance, tourIdx, a, b);
            if (newSolution.cost < solution.cost) {
                solution = newSolution;
            }
        }
        return solution;
    }

    function twoOptStep(solution: Solution, instance: Instance, tidx: number, a: number, b: number): Solution {
        const tours = cloneDeep(solution.tours);
        const tour = tours[tidx];
        tours[tidx] = partialReverse(tour, a, b);
        return Evaluator.evaluate(tours, instance);
    }

    export function threeOpt(solution: Solution, instance: Instance): Solution {
        let improvement = true;
        while (improvement) {
            let costBefore = solution.cost;
            solution = threeOptAllCombinations(solution, instance);
            if (solution.cost === costBefore) improvement = false;
        }
        return solution;
    }

    export function threeOptAllCombinations(solution: Solution, instance: Instance): Solution {
        const tours = cloneDeep(solution.tours);
        tours.forEach((tour, tidx) => {
            for (let a = 0; a <= tour.length - 1; a++) {
                for (let b = a + 1; b <= tour.length - 1; b++) {
                    for (let c = b + 1; c <= tour.length; c++) {
                        const newSolution = threeOptStep(solution, instance, tidx, a, b, c);
                        if (newSolution.cost < solution.cost) {
                            solution = newSolution;
                        }
                    }
                }
            }
        });
        return solution;
    }


    export function threeOptStep(solution: Solution, instance: Instance, tidx: number, a: number, b: number, c: number): Solution {
        const tours = cloneDeep(solution.tours);
        //const tourIdx = randInt(0, tours.length - 1);
        const tour = tours[tidx];
        //let a = randInt(0, tour.length - 1);
        //let b = randInt(0, tour.length - 1);
        //let c = randInt(0, tour.length);
        //if (b < a) [a, b] = [b, a];
        //if (c < b) [c, b] = [b, c];
        const fixedFront = tour.slice(0, a);
        const fixedEnd = tour.slice(c, tour.length + 1);
        const seg1 = tour.slice(a, b);
        const seg2 = tour.slice(b, c);
        const recombinations = [
            [seg2, seg1],
            [seg1, seg2.reverse()],
            [seg1.reverse(), seg2],
            [seg2.reverse(), seg1.reverse()],
            [seg2.reverse(), seg1],
            [seg2, seg1.reverse()],
            [seg1.reverse(), seg2.reverse()]
        ].map(xs => [...fixedFront, ...xs[0], ...xs[1], ...fixedEnd]);
        const evaluations = recombinations.map(x => {
            const newTours = cloneDeep(tours);
            newTours[tidx] = x;
            return Evaluator.evaluate(newTours, instance);
        }).sort((a, b) => a.cost - b.cost);
        return evaluations[0];
    }
}


function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// begin included, end not included
export function partialReverse(arr, begin, end) {
    const arrEnd = arr.slice(end, arr.length + 1);
    const arrMid = arr.slice(begin, end);
    const arrBegin = arr.slice(0, begin);
    return arrBegin.concat(arrMid.reverse(), arrEnd);
}