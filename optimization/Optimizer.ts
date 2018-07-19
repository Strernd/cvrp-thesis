import { Instance } from "../types/Instance";
import { Solution } from "../types/Solution";
import { Feedback } from "../types/Feedback";
import { Parameters, RecreateParamters } from "../types/Parameters";
import { Ruin } from "./ruinAndRecreate/Ruin";
import { Recreate } from "./ruinAndRecreate/Recreate";
import { cloneDeep, range } from 'lodash';
import { Options } from "../types/Options";
import { Timer } from "../helper/Timer";
import { KOpt } from "./kopt/KOpt";
import { Evaluator } from "../evaluation/Evaluator";
import { Savings } from "./savings/Savings";

export namespace Optimizer {

    export function savings(instance: Instance): Solution {
        return Savings.optimize(instance);
    }

    export function getInitialSolutionSavings2opt(instance: Instance): Solution {
        const svgs = Savings.optimize(instance);
        return KOpt.twoOpt(svgs, instance);
    }

    export function getInitialSolutionBestInsert(instance: Instance): Solution {
        const parameters: RecreateParamters = { recreateAllowInfeasibleTourSelect: false, recreateKNearest: instance.n - 1, recrerateAllowInfeasibleInsert: false }
        return Recreate.recreate([], range(2, instance.n + 1), instance, parameters);
    }

    export function step(instance: Instance, startSolution: Solution, parameters: Parameters): Solution {
        const { tours, removed } = Ruin.ruin(parameters.ruinType, startSolution, instance, parameters);
        const recreated = Recreate.recreate(tours, removed, instance, parameters);
        return recreated;
    }

    // export function twoStageOptimization(instance: Instance, startSolution: Solution, options: Options): { solution: Solution, feedback: Feedback } {
    //     const firstOpt = optimize(instance, startSolution, options);
    //     let bestSolution = firstOpt.solution;
    //     let feedback = firstOpt.feedback;
    //     const top10 = firstOpt.feedback.pool.sort((a, b) => a.cost - b.cost).slice(0, 10)
    //         .map(x => Evaluator.evaluate(x.tours, instance, true));
    //     const diverse5 = [top10[0], ...top10.map(x => {
    //         return { solution: x, common: Evaluator.commonEdges(top10[0], x) }
    //     }).sort((a, b) => a.common - b.common).map(x => x.solution).slice(0, 4)];

    //     options = cloneDeep(options);
    //     options.timeLimit = options.timeLimit / diverse5.length;

    //     diverse5.forEach(solution => {
    //         const secondOpt = optimize(instance, solution, options);
    //         if (bestSolution.cost > secondOpt.solution.cost) {
    //             bestSolution = secondOpt.solution;
    //         }
    //         feedback.pool.push(...secondOpt.feedback.pool);
    //         feedback.costs.push(...secondOpt.feedback.costs);
    //         feedback.runs += secondOpt.feedback.runs;
    //         feedback.time += secondOpt.feedback.time;
    //     })
    //     return { solution: bestSolution, feedback }
    // }

    export function optimize(instance: Instance, startSolution: Solution, options: Options): { solution: Solution, feedback: Feedback } {
        const totalTimer = new Timer();
        let bestSolution: Solution = startSolution;
        let runs = 0;
        let costs = [];
        let lastTime = 500;
        const pool: Solution[] = [];
        while (totalTimer.get() < options.timeLimit - lastTime) {
            let roundTimer = new Timer(0);
            runs++;
            let currentSolution: Solution = progressParameterOptimization(instance, startSolution);
            costs.push(currentSolution.cost);
            pool.push(currentSolution);
            if (currentSolution.cost < bestSolution.cost) {
                bestSolution = currentSolution;
            }
            lastTime = roundTimer.get();
        }
        const feedback: Feedback = { runs, costs, time: totalTimer.get(), pool }
        return { solution: bestSolution, feedback };
    }

    export function optimizeRuns(instance: Instance, startSolution: Solution, runs: number): { solution: Solution, feedback: Feedback } {
        const totalTimer = new Timer();
        let bestSolution: Solution = startSolution;
        let costs = [];
        const pool: Solution[] = [];
        for (let runCounter = 0; runCounter < runs; runCounter++) {
            let currentSolution: Solution = progressParameterOptimization(instance, startSolution);
            costs.push(currentSolution.cost);
            pool.push(currentSolution);
            if (currentSolution.cost < bestSolution.cost) {
                bestSolution = currentSolution;
            }
        }
        const feedback: Feedback = { runs, costs, time: totalTimer.get(), pool }
        return { solution: bestSolution, feedback };
    }

    export function progressParameterOptimization(instance: Instance, startSolution: Solution): Solution {
        let currentSolution = startSolution;
        let progress = 0;
        let overwriteRespectOverload = false;
        while (progress <= 1) {
            let costBefore = currentSolution.cost;
            let parameters = getParametersByProgress(instance.n, progress, (progress > 0.9 || overwriteRespectOverload));
            currentSolution = getBestOfNIterations(parameters.iterationsPerConfiguration, instance, currentSolution, parameters, (progress > 0.9 || overwriteRespectOverload));
            if (currentSolution.cost > costBefore - 0.01) {
                progress += parameters.progressIncrease;
            }
            if (progress > 0.9 && currentSolution.overload > 0) {
                progress = 0.7;
                overwriteRespectOverload = true;
            }
        }
        currentSolution = KOpt.twoOpt(currentSolution, instance);
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
        iterationsPerConfiguration: 3,
        progressIncrease: 0.1,
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(6 + 6 * progress),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: 12,
        ruinSizeMin: 1,
        ruinType: 'random'
    }
}


function getConfig2(n: number, progress: number, respectOverload: boolean): Parameters {
    return {
        iterationsPerConfiguration: 3,
        progressIncrease: 0.1,
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(6 + 6 * progress),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: Math.floor(n / 4),
        ruinSizeMin: 1,
        ruinType: 'random'
    }
}

function getConfig2A(n: number, progress: number, respectOverload: boolean): Parameters {
    return {
        iterationsPerConfiguration: 2,
        progressIncrease: 0.05,
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(6 + 6 * progress),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: Math.floor(n / 4),
        ruinSizeMin: 1,
        ruinType: 'random'
    }
}

function getConfig2B(n: number, progress: number, respectOverload: boolean): Parameters {
    return {
        iterationsPerConfiguration: 4,
        progressIncrease: 0.05,
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(6 + 6 * progress),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: Math.floor(n / 4),
        ruinSizeMin: 1,
        ruinType: 'random'
    }
}

function getConfig2C(n: number, progress: number, respectOverload: boolean): Parameters {
    return {
        iterationsPerConfiguration: 2,
        progressIncrease: 0.2,
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(6 + 6 * progress),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: Math.floor(n / 4),
        ruinSizeMin: 1,
        ruinType: 'random'
    }
}


function getConfig2D(n: number, progress: number, respectOverload: boolean): Parameters {
    return {
        iterationsPerConfiguration: 4,
        progressIncrease: 0.2,
        recreateAllowInfeasibleTourSelect: false,
        recreateKNearest: Math.floor(6 + 6 * progress),
        recrerateAllowInfeasibleInsert: !respectOverload,
        ruinSizeMax: Math.floor(n / 4),
        ruinSizeMin: 1,
        ruinType: 'random'
    }
}




