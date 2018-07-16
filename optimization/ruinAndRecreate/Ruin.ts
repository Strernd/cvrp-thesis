import { Solution } from "../../types/Solution";
import { Instance } from "../../types/Instance";
import { Parameters } from "../../types/Parameters";
import { cloneDeep } from "lodash";
import { Tour } from "../../types/Tour";

export namespace Ruin {

    export function random(solution: Solution, instance: Instance, parameters: Parameters): { tours: Tour[], removed: number[] } {
        let tours = cloneDeep(solution.tours)
        let ruinSize = determineRuineSize(parameters);

        let removed = []
        for (let i = 0; i < ruinSize; i++) {
            let r1 = Math.floor(Math.random() * (tours.length));
            let r2 = Math.floor(Math.random() * (tours[r1].length));
            let rm = tours[r1].splice(r2, 1);
            if (tours[r1].length === 0) tours.splice(r1, 1);
            removed = removed.concat(rm);
        }
        return { tours, removed };
    }

    export function determineRuineSize(parameters: Parameters) {
        return parameters.ruinSizeMin + Math.round(Math.random() * (parameters.ruinSizeMax - parameters.ruinSizeMin));
    }

    function removeFromToursByIdx(tours: Tour[], tourIdx: number, customerIdx: number): number {
        const rm = tours[tourIdx].splice(customerIdx, 1);
        if (tours[tourIdx].length === 0) tours.splice(tourIdx, 1);
        return rm[0];
    }

    function ruinCondition(solution: Solution, condition: (number) => boolean): { tours: Tour[], removed: number[] } {
        const tours = cloneDeep(solution.tours)
        const removed = [];
        tours.forEach((tour, tourIdx) => tour.forEach((customer, customerIdx) => {
            if (condition(customer)) {
                removed.push(removeFromToursByIdx(tours, tourIdx, customerIdx))
            }
        }))
        return { tours, removed };
    }

    export function radial(solution: Solution, instance: Instance, parameters: Parameters): { tours: Tour[], removed: number[] } {
        const radialSize = parameters.radialRuinRadius;
        const r1 = Math.floor(Math.random() * (solution.tours.length));
        const r2 = Math.floor(Math.random() * (solution.tours[r1].length));
        const center = solution.tours[r1][r2];
        return ruinCondition(solution, (customer) => instance.distances[center][customer] <= radialSize);
    }

    export function demand(solution: Solution, instance: Instance, parameters: Parameters): { tours: Tour[], removed: number[] } {
        const demandMin = parameters.demandRuinMin;
        const demandMax = parameters.demandRuinMax;
        return ruinCondition(solution, (customer) => (instance.demand[customer] >= demandMin && instance.demand[customer] <= demandMax));
    }

    export function coinFlip(solution: Solution, instance: Instance, parameters: Parameters): { tours: Tour[], removed: number[] } {
        const chance = parameters.coinFlipRuinChance;
        return ruinCondition(solution, (customer) => Math.random() <= chance);
    }


}