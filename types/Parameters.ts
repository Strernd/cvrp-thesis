export interface Parameters extends RecreateParamters, RuinParameters{
}

export interface RecreateParamters {
    recreateKNearest: number;
    recreateAllowInfeasibleTourSelect: boolean;
    recrerateAllowInfeasibleInsert: boolean;
}

export interface RuinParameters{
    ruinSizeMin?: number;
    ruinSizeMax?: number;
    radialRuinRadius?: number;
    demandRuinMin?: number;
    demandRuinMax?: number;
    coinFlipRuinChance?: number; // Chance that customer is removed

}