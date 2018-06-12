import { Solution } from "../../types/Solution";
import { Instance } from "../../types/Instance";
import { Evaluator } from "../../evaluation/Evaluator";
import { Tour } from "../../types/Tour";
import { cloneDeep } from "lodash";

export namespace Savings {
    export function optimize(instance: Instance): Solution {
        const initial = createInitialTours(instance);
        let solution = initial;
        let savingsFound = true;
        while (savingsFound) {
            const savings = calculateSavings(solution.tours, instance);
            savingsFound = savings.some(x => (x.feasible && x.saving > 0));
            if (savingsFound) {
                const sorted = savings.filter(x => x.feasible).sort((a, b) => b.saving - a.saving);
                const best = sorted[0];
                solution = createNewJoinedSolution(solution, instance, best.idxA, best.idxB);
            }
        }
        return solution;
    }

    function createNewJoinedSolution(solution: Solution, instance: Instance, idxA: number, idxB: number): Solution {
        const tours = cloneDeep(solution.tours);
        tours.push([...tours[idxA], ...tours[idxB]]);
        tours.splice(Math.max(idxA, idxB), 1);
        tours.splice(Math.min(idxA, idxB), 1);
        return Evaluator.evaluate(tours, instance);
    }

    function createInitialTours(instance: Instance): Solution {
        const tours = [];
        for (let i = 2; i <= instance.n; i++) {
            tours.push([i]);
        }
        return Evaluator.evaluate(tours, instance);
    }

    function calculateSavings(tours: Tour[], instance: Instance): { idxA: number, idxB: number, saving: number, feasible: boolean }[] {
        const demands = tours.map(tour => tourDemand(tour, instance));
        const list = [];
        const dm = instance.distances;
        tours.forEach((tourA, idxA) => {
            tours.forEach((tourB, idxB) => {
                if (idxA === idxB) return;
                const tourALast = tourA[tourA.length - 1];
                const tourBFirst = tourB[0];
                const saving = dm[tourALast][1] + dm[1][tourBFirst] - dm[tourALast][tourBFirst];
                const feasible = (demands[idxA] + demands[idxB]) <= instance.c;
                list.push({ idxA, idxB, saving, feasible });
            })
        })
        return list;
    }

    function tourDemand(tour: Tour, instance: Instance): number {
        return tour.reduce((a, x) => a += instance.demand[x], 0);
    }

    function proportionSelect(xs: number[]): number {
        const sum = xs.reduce((a, x) => a += x);
        const r = Math.random() * sum;
        let i = 0;
        let c = xs[i];
        while (c < r) {
            i++;
            c += xs[i];
        }
        return i;
    }
}