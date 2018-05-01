import { Tour } from "../types/Tour";
import { Solution } from "../types/Solution";
import { Instance } from "../types/Instance";

export namespace Evaluator {

    export function evaluate(tours: Tour[], instance: Instance): Solution {
        let feasible = true;
        const loads = [];
        let overload = 0;
        const cost = tours.reduce((a, x, i) => {
            const evaluated = costSingleTour(x, instance);
            a += evaluated.cost;
            if (!evaluated.feasible) feasible = false;
            loads.push(evaluated.load);
            if(evaluated.load > instance.c) overload += evaluated.load - instance.c;
            return a;
        }, 0)
        return {
            tours,
            feasible,
            loads,
            cost,
            overload
        }
    }

    export function costSingleTour(tour: Tour, instance: Instance): { cost: number, feasible: boolean, load: number } {
        const dm = instance.distances;
        let load = 0;
        const cost = tour.reduce((a, x, i) => {
            if (tour[i + 1]) a += dm[x][tour[i + 1]];
            else a += dm[x][instance.depot];
            load += instance.demand[x];
            return a;
        }, dm[instance.depot][tour[0]]);
        return {
            cost,
            load,
            feasible: (load <= instance.c)
        };
    }
}