import { Instance } from "../types/Instance";
import { Solution } from "../types/Solution";
import { Parameters, RecreateParamters } from "../types/Parameters";
import { Ruin } from "./ruinAndRecreate/Ruin";
import { Recreate } from "./ruinAndRecreate/Recreate";
import { range } from 'lodash';
import { Communicator } from "../communication/Communicator";
import { Options } from "../types/Options";
import { Timer } from "../helper/Timer";
import { Z_BEST_COMPRESSION } from "zlib";

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

    export function optimize(instance: Instance, startSolution: Solution, options: Options): Solution {
        const timer = new Timer(250);
        let bestSolution: Solution = startSolution;
        while (timer.get() < options.timeLimit) {
            let currentSolution: Solution = progressParameterOptimization(instance, startSolution);
            if (currentSolution.cost < bestSolution.cost) {
                bestSolution = currentSolution;
                // Communicator.send(instance, bestSolution);
            }
        }
        return bestSolution;
    }

    export function progressParameterOptimization(instance: Instance, startSolution: Solution): Solution {
        let currentSolution = startSolution;
        let progress = 0;
        while (progress <= 1) {
            let costBefore = currentSolution.cost;
            let parameters = getParametersByProgress(instance.n, progress);
            currentSolution = getBestOfNIterations(10, instance, currentSolution, parameters, (progress > 0.9));
            if (currentSolution.cost > costBefore - 0.01) {
                progress += 0.1;
            }
        }
        return currentSolution;
    }

    export function getBestOfNIterations(n: number, instance: Instance, currentSolution: Solution, parameters: Parameters, respectOverload: boolean = false) {
        for (let i = 0; i < 10; i++) {
            let newSolution = step(instance, currentSolution, parameters);
            if (newSolution.cost < currentSolution.cost || (respectOverload && currentSolution.overload > newSolution.overload)) {
                currentSolution = newSolution;
            }
        }
        return currentSolution;
    }

}


function getParametersByProgress(n: number, progress: number): Parameters {
    return {
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(3 + progress * n),
        recrerateAllowInfeasibleInsert: (progress < 0.9),
        ruinSizeMax: Math.floor((1 - progress) * (n / 2) + 1),
        ruinSizeMin: Math.floor((1 - progress) * (n / 3) + 1),
    }
}