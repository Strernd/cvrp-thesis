export interface Parameters extends RecreateParamters, RuinParameters{
    iterationsPerConfiguration: number;
    progressIncrease: number;
}

export interface RecreateParamters {
    recreateKNearest: number;
    recreateAllowInfeasibleTourSelect: boolean;
    recrerateAllowInfeasibleInsert: boolean;
}

export interface RuinParameters{
    ruinType: string;
    ruinSizeMin?: number;
    ruinSizeMax?: number;
    radialRuinRadius?: number;
    demandRuinMin?: number;
    demandRuinMax?: number;
    coinFlipRuinChance?: number; // Chance that customer is removed

}