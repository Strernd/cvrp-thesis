import { Tour } from './Tour';

export interface Solution {
    tours: Tour[];
    loads: number[];
    cost: number;
    feasible: boolean;
    overload: number;
}