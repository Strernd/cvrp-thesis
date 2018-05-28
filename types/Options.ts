import { Parameters } from "./Parameters";

export interface Options{
    timeLimit: number;
    nr: number;
    siblings: number;
    fixedParameters: boolean;
    parameters?: Parameters;
}