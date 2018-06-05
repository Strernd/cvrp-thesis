import { Optimizer } from "./optimization/Optimizer";
import { Communicator } from './communication/Communicator';
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";

// ca 50 in 5000
const options: Options = {
    timeLimit: 10000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}
const instance = vrp.get("A-n33-k6");
console.log("===== ROUND 1 =====")
console.time('optimize');
let {solution, feedback} = Optimizer.optimize(instance, Optimizer.getInitialSolution(instance), options);
console.timeEnd('optimize');
let worse = (solution.cost - instance.best) / instance.best;
console.log(instance.best, Math.round(solution.cost));
console.log("Solution quality: " + Math.round(worse * 1000) / 10 + "%")
console.log(feedback.runs, feedback.costs.reduce((a, x) => a + x) / feedback.costs.length);

console.log("===== ROUND 2 =====")
let newResult = Optimizer.optimize(instance, solution, options);
solution = newResult.solution;
feedback = newResult.feedback;
worse = (solution.cost - instance.best) / instance.best;
console.log(instance.best, Math.round(solution.cost));
console.log("Solution quality: " + Math.round(worse * 1000) / 10 + "%")
console.log(feedback.runs, feedback.costs.reduce((a, x) => a + x) / feedback.costs.length);

console.log("===== ROUND 3 =====")
newResult = Optimizer.optimize(instance, solution, options);
solution = newResult.solution;
feedback = newResult.feedback;
worse = (solution.cost - instance.best) / instance.best;
console.log(instance.best, Math.round(solution.cost));
console.log("Solution quality: " + Math.round(worse * 1000) / 10 + "%")
console.log(feedback.runs, feedback.costs.reduce((a, x) => a + x) / feedback.costs.length);
