import { Optimizer } from "../optimization/Optimizer";
import * as _ from 'lodash';
import { Instance } from "../types/Instance";
import { Parameters } from "../types/Parameters";
import { Timer } from "./Timer";
import { Solution } from "../types/Solution";

export namespace ParameterBenchmark {

    export function benchmark(instance: Instance, parameter: { name: string, min: number, max: number, steps: number, double?: string, doubleOffset?: number },
        secondParameter: { name: string, min: number, max: number, steps: number },
        runsPerConfiguration: number, runsPerOptimization: number, parametersOverwrite?: any, ) {

        const startSolution = Optimizer.getInitialSolutionBestInsert(instance);

        const baseParameters: Parameters = {
            iterationsPerConfiguration: 5,
            progressIncrease: 0.1,
            recreateKNearest: 10,
            recreateAllowInfeasibleTourSelect: false,
            recrerateAllowInfeasibleInsert: false,
            ruinType: 'random',
            ruinSizeMin: 2,
            ruinSizeMax: 8,
            radialRuinRadius: 10,
            demandRuinMin: 10,
            demandRuinMax: 30,
            coinFlipRuinChance: 0.3,
        }

        const parameters = {
            ...baseParameters,
            ...parametersOverwrite
        }
        const results = [];
        for (let i = 0; i <= parameter.steps; i++) {
            parameters[parameter.name] = parameter.min + ((parameter.max - parameter.min) / parameter.steps) * i;
            if (parameter.double) parameters[parameter.double] = parameter.doubleOffset + parameter.min + ((parameter.max - parameter.min) / parameter.steps) * i;
            const secondParamIterations = (secondParameter) ? secondParameter.steps : 0;
            for (let j = 0; j <= secondParamIterations; j++) {
                if (secondParameter) parameters[secondParameter.name] = secondParameter.min + ((secondParameter.max - secondParameter.min) / secondParameter.steps) * j;
                const costs = [];
                const times = [];
                for (let k = 0; k < runsPerConfiguration; k++) {
                    const timer = new Timer();
                    let solution: Solution = Optimizer.getBestOfNIterations(runsPerOptimization, instance, _.cloneDeep(startSolution), parameters, true);
                    times.push(timer.get());
                    costs.push(solution.cost);
                }
                results.push({
                    costs,
                    times,
                    parameters,
                    bestInsertCost: startSolution.cost,
                    savings2optCost: Optimizer.getInitialSolutionSavings2opt(instance).cost,
                    parameterValue: parameters[parameter.name],
                    parameterName: parameter.name,
                    secondParameterValue: (secondParameter) ? parameters[secondParameter.name] : null,
                    secondParameterName: (secondParameter) ? secondParameter.name : null,
                    averageCosts: costs.reduce((a, x) => a += x) / costs.length,
                    minCosts: Math.min(...costs),
                    runsPerOptimization,
                    runsPerConfiguration,
                    averageTime: times.reduce((a, x) => a += x) / times.length,
                });
            }
        }
        return results;
    }
}
