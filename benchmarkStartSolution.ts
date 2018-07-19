import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import { table } from 'table';
import { Instance } from "./types/Instance";
const chalk = require('chalk');

const instanceNames = [
    'A-n32-k5',
    'B-n39-k5',
    'A-n44-k7',
    'A-n45-k6',
    'A-n45-k7',
    'B-n50-k8',
    'A-n60-k9',
    'A-n61-k9',
    'B-n66-k9',
    'A-n80-k10',
];

const instances: Instance[] = instanceNames.map(vrp.get);
// ca 50 in 5000


instances.forEach((instance, i) => {
    const bestinsert = Optimizer.getInitialSolutionBestInsert(instance);
    const savings = Optimizer.getInitialSolutionSavings2opt(instance);
    console.log(instanceNames[i], Math.floor(instance.best), Math.floor(bestinsert.cost), Math.floor(savings.cost));
})
