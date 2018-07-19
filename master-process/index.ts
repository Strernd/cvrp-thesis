import { Instance } from "../types/Instance";
import * as vrp from 'vrpinstances';
import { Optimizer } from "../optimization/Optimizer";
import { Options } from "../types/Options";
import { Solution } from "../types/Solution";
import { Remote } from './Remote'
import { Feedback } from "../types/Feedback";

const instance: Instance = vrp.get("B-n57-k7");
const startSolution = Optimizer.getInitialSolutionSavings2opt(instance);
console.log("start solution ", startSolution.cost)
const options: Options = {
    timeLimit: 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}
// 1 in 10s ca 65 runs
// 1 in 2,5s 12 runs
const n = 10;
console.log("Making calls");
const calls = [];
console.time('fire')
for (let i = 0; i < n; i++) {
    calls.push(Remote.aws(instance, startSolution, options))
}
console.timeEnd('fire')

console.time('lambda');

console.log("Opt Solution", instance.best);
Promise.all(calls).then((results: { solution: Solution, feedback: Feedback }[]) => {
    const averages = [];
    console.timeEnd('lambda');
    results.forEach(x => {
        let avg = roundedAvg(x.feedback.costs);
        //console.log(Math.round(x.solution.cost), x.feedback.runs, avg);
        averages.push(avg);
    })
    const costs = results.map(x => x.solution.cost);
    const bestSolution = results.map(x => x.solution).reduce((a, x) => {
        if(x.cost < a.cost) a = x;
        return a;
    },{cost: Number.MAX_VALUE, tours: null});
    console.log('best ', Math.round(bestSolution.cost));
    const worse = (bestSolution.cost - instance.best) / instance.best;
    console.log("Solution quality: " + Math.round(worse * 1000) / 10 + "%")
    console.log("Total runs", results.map(x => x.feedback.runs).reduce((a, x) => a + x));
    console.log("Total average", roundedAvg(averages));
}).catch(console.warn);

function roundedAvg(xs: number[]) {
    return Math.round(xs.reduce((a, x) => a + x) / xs.length);
}