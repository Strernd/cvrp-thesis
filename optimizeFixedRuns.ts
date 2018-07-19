import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';

const times = [];
const costs = [];
for (let i = 0; i < 50; i++) {
    const instance = vrp.get("B-n57-k7")
    const startSolution = Optimizer.getInitialSolutionSavings2opt(instance);
    const solution = Optimizer.optimizeRuns(instance, startSolution, 572)
    times.push([solution.feedback.time]);
    costs.push([solution.solution.cost]);

}
require('fs').writeFileSync('./results/timeMeasured.json', JSON.stringify({ times, costs }));