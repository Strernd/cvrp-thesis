import { Instance } from "../types/Instance";
import { Solution } from "../types/Solution";
import { Parameters, RecreateParamters } from "../types/Parameters";
import { Ruin } from "./ruinAndRecreate/Ruin";
import { Recreate } from "./ruinAndRecreate/Recreate";
import * as range from "lodash.range";
import { Communicator } from "../communication/Communicator";

export namespace Optimizer {

    export function getInitialSolution(instance: Instance): Solution {
        const parameters: RecreateParamters = { recreateAllowInfeasibleTourSelect: false, recreateKNearest: instance.n - 1, recrerateAllowInfeasibleInsert: false }
        return Recreate.recreate([], range(2, instance.n + 1), instance, parameters);
    }
    export function step(instance: Instance, startSolution: Solution, parameters: Parameters): Solution {
        const { tours, removed } = Ruin.random(startSolution, parameters);
        const recreated = Recreate.recreate(tours, removed, instance, parameters);
        return recreated;
    }

    export function optimize(instance: Instance): Solution {
        const parameters: Parameters = {
            recreateAllowInfeasibleTourSelect: false,
            recreateKNearest: instance.n / 2,
            recrerateAllowInfeasibleInsert: true,
            ruinSizeMax: 5,
            ruinSizeMin: 1
        }
        const startSolution = getInitialSolution(instance);
        let currentSolution = startSolution;
        let improvements = 0;
        for (let i = 0; i < 1000; i++) {
            if (i > 500) parameters.recrerateAllowInfeasibleInsert = false;
            let newSolution = step(instance, currentSolution, parameters);
            if (newSolution.cost <= currentSolution.cost || (i > 500 && currentSolution.overload > newSolution.overload)) {
                currentSolution = newSolution;
                Communicator.send(instance, currentSolution);
                improvements++;
            }
        }
        console.log(improvements);
        return currentSolution;
    }
}