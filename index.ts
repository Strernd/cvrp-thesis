import { Optimizer } from "./optimization/Optimizer";
import { Communicator } from './communication/Communicator';
import * as vrp from 'vrpinstances';



setInterval(() => {
    const instance = vrp.get("A-n32-k5");
    const solution = Optimizer.optimize(instance);
    console.log(solution, instance.best)
    // Communicator.send(instance, solution);
}, 20000)
