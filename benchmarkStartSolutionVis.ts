import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import { table } from 'table';
import { Instance } from "./types/Instance";
import { Communicator } from "./communication/Communicator";
const chalk = require('chalk');

// const instanceNames =vrp.listInstances();
const instanceNames = ['A-n33-k5'];

const instances: Instance[] = instanceNames.map(vrp.get);
// ca 50 in 5000
const options: Options = {
    timeLimit: 30 * 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}
instances.forEach((instance, i) => {
    const bestinsert = Optimizer.getInitialSolutionBestInsert(instance);
    const savings = Optimizer.getInitialSolutionSavings2opt(instance);
    const {solution} = Optimizer.optimize(instance,savings,options)
    console.log(instanceNames[i], Math.floor(instance.best), Math.floor(bestinsert.cost), Math.floor(savings.cost));
    console.log(solution.cost);
    setInterval(()=> {
        Communicator.send(instance,savings)
        setTimeout(()=>{
        Communicator.send(instance,solution)
        },7500)
    },15000)
})
