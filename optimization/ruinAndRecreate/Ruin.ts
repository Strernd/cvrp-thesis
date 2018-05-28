import { Solution } from "../../types/Solution";
import { Instance } from "../../types/Instance";
import { Parameters } from "../../types/Parameters";
import { cloneDeep } from "lodash";
import { Tour } from "../../types/Tour";

export namespace Ruin {

    export function random(solution: Solution, parameters: Parameters): { tours: Tour[], removed: number[] } {
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

}