import { Instance } from "../types/Instance";
import { Solution } from "../types/Solution";
import { Feedback } from "../types/Feedback";
import { Parameters, RecreateParamters } from "../types/Parameters";
import { Ruin } from "./ruinAndRecreate/Ruin";
import { Recreate } from "./ruinAndRecreate/Recreate";
import { range } from 'lodash';
import { Communicator } from "../communication/Communicator";
import { Options } from "../types/Options";
import { Timer } from "../helper/Timer";
import { Z_BEST_COMPRESSION } from "zlib";
import { KOpt } from "./kopt/KOpt";

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

    export function optimize(instance: Instance, startSolution: Solution, options: Options): { solution: Solution, feedback: Feedback } {
        const totalTimer = new Timer();
        let bestSolution: Solution = startSolution;
        let runs = 0;
        let costs = [];
        let lastTime = 500;

        while (totalTimer.get() < options.timeLimit - lastTime) {
            let roundTimer = new Timer(0);
            runs++;
            let currentSolution: Solution = progressParameterOptimization(instance, startSolution);
            costs.push(currentSolution.cost);
            if (currentSolution.cost < bestSolution.cost) {
                bestSolution = currentSolution;
                // Communicator.send(instance, bestSolution);
            }
            lastTime = roundTimer.get();
        }
        /*for (let i = 0; i < instance.n * 20; i++) {
            let newSolution = KOpt.twoOpt(bestSolution, instance);
            if (newSolution.cost < bestSolution.cost) bestSolution = newSolution;
        }*/
        const feedback: Feedback = { runs, costs, time: totalTimer.get() }
        return { solution: bestSolution, feedback };
    }

    export function randomParameterOptimization(instance: Instance, startSolution: Solution): Solution {
        let currentSolution = startSolution;
        for (let i = 0; i < 10; i++) {
            const parameters = getRandomParameters(instance.n)
            currentSolution = getBestOfNIterations(1, instance, currentSolution, parameters, !parameters.recrerateAllowInfeasibleInsert)
        }
        currentSolution = getBestOfNIterations(20, instance, currentSolution, getEndParameters(instance.n), true);
        return currentSolution;
    }

    export function progressParameterOptimization(instance: Instance, startSolution: Solution): Solution {
        let currentSolution = startSolution;
        let progress = 0;
        let overwriteRespectOverload = false;
        while (progress <= 1) {
            let costBefore = currentSolution.cost;
            let parameters = getParametersByProgress(instance.n, progress, (progress > 0.9 || overwriteRespectOverload));
            currentSolution = getBestOfNIterations(3, instance, currentSolution, parameters, (progress > 0.9 || overwriteRespectOverload));
            if (currentSolution.cost > costBefore - 0.01) {
                progress += 0.1;
            }
            if (progress > 0.9 && currentSolution.overload > 0) {
                progress = 0.7;
                overwriteRespectOverload = true;
            }
        }
        /*for (let i = 0; i < instance.n * 20; i++) {
            let newSolution = KOpt.threeOpt(currentSolution, instance);
            if (newSolution.cost < currentSolution.cost) currentSolution = newSolution;
        }*/
        currentSolution = KOpt.twoOpt(currentSolution, instance);
        // currentSolution = KOpt.randomTwoOpt(currentSolution, instance, instance.n * 20)
        return currentSolution;
    }

    export function getBestOfNIterations(n: number, instance: Instance, currentSolution: Solution, parameters: Parameters, respectOverload: boolean = false) {
        for (let i = 0; i < n; i++) {
            let newSolution = step(instance, currentSolution, parameters);
            if (newSolution.cost < currentSolution.cost || (respectOverload && currentSolution.overload > newSolution.overload)) {
                currentSolution = newSolution;
            }
        }
        return currentSolution;
    }

}


function getParametersByProgress(n: number, progress: number, respectOverload: boolean): Parameters {
    return {
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(3 + progress * n * 0.9),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: Math.floor((1 - progress) * (n / 2) + 1),
        ruinSizeMin: Math.floor((1 - progress) * (n / 3) + 1),
    }
}

function getRandomParameters(n: number): Parameters {
    return {
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(Math.random() * n) + 1,
        recrerateAllowInfeasibleInsert: (Math.random() > 0.5),
        ruinSizeMax: Math.floor(Math.random() * n / 2) + 1,
        ruinSizeMin: Math.floor(Math.random() * n / 4) + 1,
    }
}

function getEndParameters(n: number): Parameters {
    return {
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: n,
        recrerateAllowInfeasibleInsert: false,
        ruinSizeMax: 1 + Math.floor(n / 30),
        ruinSizeMin: 1 + Math.floor(n / 40),
    }
}