import { Instance } from "../types/Instance";
import * as vrp from 'vrpinstances';
import { Optimizer } from "../optimization/Optimizer";
import { Options } from "../types/Options";
import { Solution } from "../types/Solution";
import { Remote } from './Remote'
import { Feedback } from "../types/Feedback";
const chalk = require('chalk');
import { table } from 'table';

const n = 1;
const instanceNames = [
    'A-n32-k5',
    'B-n39-k5',
    'A-n44-k7',
    'A-n45-k6',
    'A-n45-k7',
    'B-n50-k8',
    'A-n60-k9',
    'A-n61-k9',
    'B-n66-k9',
    'A-n80-k10',
];
const instances: Instance[] = instanceNames.map(vrp.get);
const tableData = [];
const header = ['name', 'runs', 'time', 'best', 'avg', 'optimal', 'quality', 'avg to best'].map(x => chalk.bold(x));
let points = 0;
const globalCalls = [];

instances.forEach((instance, i) => {
    const startSolution = Optimizer.getInitialSolutionSavings2opt(instance);
    const options: Options = {
        timeLimit: 2500,
        nr: 1,
        siblings: 1,
        fixedParameters: false,
    }

    const calls = [];
    const name = instanceNames[i];
    console.log('Making calls for instance ' + name);
    for (let i = 0; i < n; i++) {
        calls.push(Remote.google(instance, startSolution, options))
    }
    globalCalls.push(...calls);
    Promise.all(calls).then((results: { solution: Solution, feedback: Feedback }[]) => {
        const averages = [];
        results.forEach(x => {
            let avg = roundedAvg(x.feedback.costs);
            averages.push(avg);
        })
        const costs = results.map(x => x.solution.cost);
        const bestSolution = results.map(x => x.solution).reduce((a, x) => {
            if (x.cost < a.cost) a = x;
            return a;
        }, { cost: Number.MAX_VALUE, tours: null });
        const totalRuns = results.reduce((a, x) => a += x.feedback.runs, 0);
        const maxTime = Math.max(...results.map(x => x.feedback.time));
        let worse = 1 - ((bestSolution.cost - instance.best) / instance.best);
        points += worse * 100;
        let percent = Math.round(worse * 1000) / 10
        const avgToBest = Math.round(roundedAvg(averages) / bestSolution.cost * 100) / 100
        tableData.push([
            name,
            totalRuns,
            Math.round(maxTime / 10) / 100 + 's',
            Math.round(bestSolution.cost),
            roundedAvg(averages),
            instance.best,
            colorPercent(percent),
            avgToBest
        ].map(String))
    }).catch(console.warn);
})

Promise.all(globalCalls).then(() => {
    let wholeTable = [header, ...tableData.sort()]
    const output = table(wholeTable);
    console.log(output);
    console.log("Points: ", Math.round(points) + "/" + 100 * instances.length);
})

function roundedAvg(xs: number[]) {
    return Math.round(xs.reduce((a, x) => a + x) / xs.length);
}

function colorPercent(p) {
    if (p > 92.5) return chalk.green(p + "%")
    else if (p > 85) return chalk.yellow(p + "%")
    else return chalk.red(p + "%")
}