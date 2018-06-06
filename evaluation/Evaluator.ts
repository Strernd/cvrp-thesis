import { Tour } from "../types/Tour";
import { Solution } from "../types/Solution";
import { Instance } from "../types/Instance";

export namespace Evaluator {

    export function evaluate(tours: Tour[], instance: Instance, withSuccessors: boolean = false): Solution {
        let feasible = true;
        const loads = [];
        let overload = 0;
        const successors = {};
        const cost = tours.reduce((a, x, i) => {
            const evaluated = costSingleTour(x, instance, withSuccessors);
            if (withSuccessors) {
                Object.assign(successors, evaluated.successors);
            }
            a += evaluated.cost;
            if (!evaluated.feasible) feasible = false;
            loads.push(evaluated.load);
            if (evaluated.load > instance.c) overload += evaluated.load - instance.c;
            return a;
        }, 0)
        return {
            tours,
            feasible,
            loads,
            cost,
            overload,
            successors
        }
    }

    export function costSingleTour(tour: Tour, instance: Instance, withSuccessors: boolean = false): { cost: number, feasible: boolean, load: number, successors: { [key: number]: number } } {
        const dm = instance.distances;
        let load = 0;
        const cost = tour.reduce((a, x, i) => {
            if (tour[i + 1]) a += dm[x][tour[i + 1]];
            else a += dm[x][instance.depot];
            load += instance.demand[x];
            return a;
        }, dm[instance.depot][tour[0]]);
        const successors = {};
        if(withSuccessors){
            tour.forEach((x, i) => {
                successors[x] = tour[i + 1] || 0;
            })
        }
        return {
            cost,
            load,
            feasible: (load <= instance.c),
            successors
        };
    }

    export function commonEdges(a: Solution, b: Solution): number {
        let common = 0;
        let total = 0;
        Object.keys(a.successors).forEach(node => {
            total++;
            if (a.successors[node] === b.successors[node]) common++;
        })
        return Math.round(common / total * 100) / 100;
    }
}