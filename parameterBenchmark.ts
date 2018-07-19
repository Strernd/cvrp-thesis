import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import * as _ from 'lodash';
import { table } from 'table';
import { Instance } from "./types/Instance";
import { Parameters } from "./types/Parameters";
import { start } from "repl";
import * as fs from "fs";
import { ParameterBenchmark } from "./helper/ParameterBenchmark";

const instanceNames = [
    'A-n33-k5',
    'A-n38-k5',
    'A-n39-k5',
    'A-n53-k7',
    'A-n61-k9',
    'B-n41-k6',
    'B-n45-k6',
    'B-n51-k7',
    'B-n57-k7',
    'B-n67-k10',
];
const instances: Instance[] = instanceNames.map(vrp.get);

const instance = instances[8];

const results = ParameterBenchmark.benchmark(instance, { name: 'ruinSizeMin', min: 2, max: 12, steps: 5, double: "ruinSizeMax", doubleOffset: 0 },
 {name: 'recreateKNearest', min: 2, max: 12, steps: 5}, 40, 1000, { ruinType: 'random' })

fs.writeFileSync('./templates/results.json', JSON.stringify(results));