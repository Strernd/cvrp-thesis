import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import { table } from 'table';
import { Instance } from "./types/Instance";
const chalk = require('chalk');

// const instanceNames = [
//     'A-n32-k5',
//     'B-n39-k5',
//     'A-n44-k7',
//     'A-n45-k6',
//     'A-n45-k7',
//     'B-n50-k8',
//     'A-n60-k9',
//     'A-n61-k9',
//     'B-n66-k9',
//     'A-n80-k10',
// ];

// selected by where savings+2opt performs not good enough
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
// ca 50 in 5000
const options: Options = {
    timeLimit: 6 * 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}
const header = ['name', 'runs', 'time', 'best', 'avg', 'optimal', 'quality', 'avg to best'].map(x => chalk.bold(x));
const tableData = []
let points = 0;
console.log("Time for each instance: ", options.timeLimit + 'ms');
instances.forEach((instance, i) => {
    const name = instanceNames[i];
    console.log("Optimizing " + name);
    let { solution, feedback } = Optimizer.optimize(instance, Optimizer.getInitialSolutionSavings2opt(instance), options);
    let worse = 1 - ((solution.cost - instance.best) / instance.best);
    const avg = Math.round(feedback.costs.reduce((a, x) => a + x) / feedback.costs.length);
    const avgToBest = Math.round(avg / solution.cost * 100) / 100
    points += worse * 100;
    let percent = Math.round(worse * 1000) / 10
    tableData.push([
        name,
        feedback.runs,
        Math.round(feedback.time / 10) / 100 + 's',
        Math.round(solution.cost),
        avg,
        instance.best,
        colorPercent(percent),
        avgToBest
    ].map(String))
})
let wholeTable = [header, ...tableData.sort()]
const output = table(wholeTable);
console.log(output);
console.log("Points: ", Math.round(points) + "/" + 100 * instances.length);

function colorPercent(p) {
    if (p > 92.5) return chalk.green(p + "%")
    else if (p > 85) return chalk.yellow(p + "%")
    else return chalk.red(p + "%")
}
