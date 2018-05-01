import { DistanceMatrix } from './DistanceMatrix';

export interface Instance {
    n: number;
    distances: DistanceMatrix;
    demand: { [n: number]: number };
    c: number;
    depot: number;
    best?: number;
    coords?: any;
}