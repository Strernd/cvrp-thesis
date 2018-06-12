import { Optimizer } from "./optimization/Optimizer";
import * as vrp from 'vrpinstances';
import { Options } from "./types/Options";
import { table } from 'table';
import { Instance } from "./types/Instance";
import { KOpt } from "./optimization/kopt/KOpt";
import { Timer } from "./helper/Timer";

const chalk = require('chalk');

const instanceNames = vrp.listInstances();
const instances: Instance[] = instanceNames.map(vrp.get);
// ca 50 in 5000
const options: Options = {
    timeLimit: 6 * 1000,
    nr: 1,
    siblings: 1,
    fixedParameters: false,
}
const header = ['name', 'time', 'best', 'optimal', 'quality', 'quality2opt', 'quality2optrandom','diff'].map(x => chalk.bold(x));
const tableData = []
let points = 0;
console.log("Time for each instance: ", options.timeLimit + 'ms');
instances.forEach((instance, i) => {
    const timer = new Timer();
    const name = instanceNames[i];
    console.log("Optimizing " + name);
    let solution = Optimizer.savings(instance);
    let worse = 1 - ((solution.cost - instance.best) / instance.best);
    let percent = Math.round(worse * 1000) / 10
    solution = KOpt.twoOpt(solution, instance);
    let worse2Opt = 1 - ((solution.cost - instance.best) / instance.best);
    let percent2Opt = Math.round(worse2Opt * 1000) / 10

    solution = KOpt.threeOpt(solution, instance);
    let worse3opt = 1 - ((solution.cost - instance.best) / instance.best);
    let percent3opt = Math.round(worse3opt * 1000) / 10
    points += worse * 100;
    tableData.push([
        name,
        timer.get() + 'ms',
        Math.round(solution.cost),
        instance.best,
        colorPercent(percent),
        colorPercent(percent2Opt),
        colorPercent(percent3opt),
        Math.round((percent3opt-percent2Opt)*100)/100
    ].map(String))
})
let wholeTable = [header, ...tableData.sort()]
const output = table(wholeTable);
console.log(output);
console.log("Points: ", Math.round(points / 5) + "/" + 100 * instances.length / 5);

function colorPercent(p) {
    if (p > 92.5) return chalk.green(p + "%")
    else if (p > 85) return chalk.yellow(p + "%")
    else return chalk.red(p + "%")
}
