import { Optimizer } from "./optimization/Optimizer";
import { Communicator } from './communication/Communicator';
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import { KOpt } from "./optimization/kopt/KOpt";

vrp.listInstances().map(x => {
    return {
        name: x,
        instance: vrp.get(x)
    }
}).forEach(x => {
    const instance = x.instance;
    console.time('optimize ' + x.name);
    let solution = Optimizer.savings(instance);
    solution = KOpt.twoOpt(solution, instance);
    console.timeEnd('optimize ' + x.name);
    let worse = (solution.cost - instance.best) / instance.best;
    // console.log(instance.best, Math.round(solution.cost));
    console.log("Solution quality: " + Math.round(worse * 1000) / 10 + "%")
})

