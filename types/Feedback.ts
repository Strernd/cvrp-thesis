import { Solution } from "./Solution";

export interface Feedback {
    runs: number;
    time: number;
    costs: number[];
    pool: Solution[]
}