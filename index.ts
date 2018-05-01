import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';

const instance = vrp.get("A-n32-k5");
const solution = Optimizer.optimize(instance);

console.log(solution);
console.log("best",instance.best);