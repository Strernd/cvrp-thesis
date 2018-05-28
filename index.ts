import { Optimizer } from "./optimization/Optimizer";
import { Communicator } from './communication/Communicator';
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";


loopOptimization();



function loopOptimization() {
    const options: Options = {
        timeLimit: 8000,
        nr: 1,
        siblings: 1,
        fixedParameters: false,
    }
    const instance = vrp.get("A-n60-k9");
    console.time('optimize');
    const solution = Optimizer.optimize(instance, Optimizer.getInitialSolution(instance), options);
    console.timeEnd('optimize');
    const worse = (solution.cost - instance.best) / instance.best;
    console.log(instance.best, Math.round(solution.cost));
    console.log("Solution quality: " + Math.round(worse * 1000) / 10 + "%")
    setInterval(loopOptimization, 0);
}