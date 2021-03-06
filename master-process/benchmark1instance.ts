import { Instance } from "../types/Instance";
import * as vrp from 'vrpinstances';
import { Optimizer } from "../optimization/Optimizer";
import { Options } from "../types/Options";
import { Solution } from "../types/Solution";
import { Remote } from './Remote'
import { Feedback } from "../types/Feedback";
import { Timer } from "../helper/Timer";

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
    'A-n69-k9',
    'A-n80-k10',
    'B-n78-k10',
    'A-n60-k9',
    'B-n43-k6',
    'B-n66-k9',
];

const instanceName = instanceNames[15];
const instance: Instance = vrp.get(instanceName);

const options: Options = {
    timeLimit: 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}
const run = 1;
const repeat = 20;
const lambdaInstances = 50;
const benchmark: any[] = [];
doLambdaOpt(0);
function doLambdaOpt(iteration: number) {
    const timer = new Timer();
    const startSolution = Optimizer.getInitialSolutionSavings2opt(instance);

    const calls = [];
    for (let i = 0; i < lambdaInstances; i++) {
        calls.push(Remote.aws(instance, startSolution, options))
    }
    Promise.all(calls).then((results: { solution: Solution, feedback: Feedback }[]) => {
        const totalRuns = results.map(x => x.feedback.runs).reduce((a, x) => a += x);
        const bestSolution = results.map(x => x.solution).reduce((a, x) => {
            if (x.cost < a.cost) a = x;
            return a;
        }, { cost: Number.MAX_VALUE, tours: null });
        benchmark.push({
            time: timer.get(),
            cost: bestSolution.cost,
            runs: totalRuns
        });
        iteration++;
        if (iteration < repeat) doLambdaOpt(iteration)
        else printResults();
    }).catch(console.warn);
}
function printResults() {
    console.time('start')
    const startSolution = Optimizer.getInitialSolutionSavings2opt(instance);
    console.timeEnd('start')
    console.log(instanceName);
    console.log('SOLUTION QUALITY');
    console.log("BEST KNOWN", instance.best);
    console.log("START ", startSolution.cost)
    console.log("BEST", Math.min(...benchmark.map(x => x.cost)));
    console.log("AVERAGE ", avg(benchmark.map(x => x.cost)))
    console.log("SD ", standardDev(benchmark.map(x => x.cost)))
    console.log('');
    console.log('TIME');
    console.log("AVERAGE ", avg(benchmark.map(x => x.time)))
    console.log("SD ", standardDev(benchmark.map(x => x.time)))
    console.log('RUNS');
    console.log("AVERAGE ", avg(benchmark.map(x => x.runs)))
    console.log("SD ", standardDev(benchmark.map(x => x.runs)))
    require('fs').writeFileSync('./benchmark/2_lambdaBenchmark_n' + lambdaInstances + '_r' + run + '_instance_' + instanceName + '.json', JSON.stringify(benchmark));
}




function avg(xs: number[]) {
    return xs.reduce((a, x) => a + x) / xs.length;
}
function roundedAvg(xs: number[]) {
    return Math.round(avg(xs));
}
function standardDev(xs: number[]) {
    const average = avg(xs);
    const sumOfSquares = xs.reduce((a, x) => {
        a += Math.pow(x - average, 2);
        return a;
    }, 0)
    return Math.sqrt(sumOfSquares / xs.length)
}
