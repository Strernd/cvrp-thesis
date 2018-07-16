import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import * as _ from 'lodash';
import { table } from 'table';
import { Instance } from "./types/Instance";
import { Parameters } from "./types/Parameters";
import { start } from "repl";
import * as fs from "fs";

const instanceNames = [
    'A-n33-k5',
    'A-n38-k5',
    'A-n39-k5',
    'A-n53-k7',
    'A-n61-k9',
    'B-n41-k6',
    'B-n45-k6',
    'B-n51-k7',
    'B-n57-k7',
    'B-n67-k10',
];
const instances: Instance[] = instanceNames.map(vrp.get);
const options: Options = {
    timeLimit: 6 * 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}

const instance = instances[2];
const min = 0;
const max = 1;
const steps = 20;
const stepSize = (max - min) / steps;

const startSolution = Optimizer.getInitialSolution(instance);
const parameters: Parameters = {
    recreateKNearest: 10,
    recreateAllowInfeasibleTourSelect: false,
    recrerateAllowInfeasibleInsert: false,
    coinFlipRuinChance: 0.1
}
const results = [];
const baseline = startSolution.cost;
for (let i = 0; i <= steps; i++) {
    let currentValue = min + stepSize * i;
    console.log("testing " + currentValue)
    parameters.coinFlipRuinChance = currentValue
    const runs = [];
    for (let j = 0; j < 250; j++) {
        let solution = Optimizer.getBestOfNIterations(20, instance, _.cloneDeep(startSolution), parameters, true);
        runs.push(baseline - solution.cost);
    }
    results.push({
        y: runs,
        name: currentValue,
        type: "box"
    });
}
console.log("baseline " + baseline)

results.forEach((runs, i) => {
    const avg = runs.y.reduce((a, x) => a += x) / runs.y.length;
    console.log(i, avg);
})

fs.writeFileSync('./templates/results.json', JSON.stringify(results));