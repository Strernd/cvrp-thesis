import { Solution } from "./types/Solution";
import { Parameters } from "./types/Parameters";
import { Options } from "./types/Options";
import { Instance } from "./types/Instance";
import { Optimizer } from "./optimization/Optimizer";
import { Feedback } from "./types/Feedback";

export namespace Webend{
    export function main(instance: Instance, startSolution: Solution, options: Options): {solution: Solution, feedback: Feedback} {
        return Optimizer.optimize(instance, startSolution, options);
    }
}

