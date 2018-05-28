import { Instance } from "../types/Instance";
import * as vrp from 'vrpinstances';
import { Optimizer } from "../optimization/Optimizer";
import { Options } from "../types/Options";

const instance = vrp.get("A-n33-k6");
const startSolution = Optimizer.getInitialSolution(instance);
const options: Options = {
    timeLimit: 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}

const event = {instance, startSolution, options};

console.log(JSON.stringify(event));