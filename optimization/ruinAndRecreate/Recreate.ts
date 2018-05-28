import { Tour } from "../../types/Tour";
import { Instance } from "../../types/Instance";
import { RecreateParamters } from "../../types/Parameters";
import { cloneDeep, flatten } from "lodash";
import { Evaluator } from "../../evaluation/Evaluator";
import { Solution } from "../../types/Solution";


export namespace Recreate {

    export function recreate(tours: Tour[], removed: Array<number>, instance: Instance, parameters: RecreateParamters): Solution {
        tours = cloneDeep(tours);
        let intermediateSolution;
        removed.forEach(x => {
            intermediateSolution = insert(tours, x, instance, parameters);
            tours = intermediateSolution.tours;
        })
        return intermediateSolution;
    }

    function getFeasibleTours(tours: Tour[], instance: Instance): Tour[] {
        return tours.filter(tour => {
            const evaluation = Evaluator.costSingleTour(tour, instance);
            return evaluation.feasible;
        })
    }

    function getPossibleNodesForInsertion(tours: Tour[], node: number, instance: Instance, parameters: RecreateParamters): number[] {
        let possibleNodes = flatten((parameters.recreateAllowInfeasibleTourSelect) ? tours : getFeasibleTours(tours, instance));
        let dist = instance.distances[node];
        possibleNodes.sort((a, b) => dist[a] - dist[b])
        possibleNodes = possibleNodes.slice(0, Math.min(parameters.recreateKNearest, possibleNodes.length));
        return possibleNodes;
    }

    function getEvaluationForFakeInsertAfterNode(tours: Tour[], nodeToBeInserted: number, nodeToInsertAfter: number, nodeMap: { [k: number]: [number, number] }, instance: Instance): Solution {
        tours = cloneDeep(tours);
        let [outerIdx, innerIdx] = nodeMap[nodeToInsertAfter];
        tours[outerIdx].splice(innerIdx, 0, nodeToBeInserted);
        return Evaluator.evaluate(tours, instance); // TODO: Use lazy evaluation
    }

    function insert(tours: Tour[], node: number, instance: Instance, parameters: RecreateParamters): Solution {
        tours = cloneDeep(tours);
        const nodeMap = {}
        tours.forEach((tour, tourId) => tour.forEach((loc, locationId) => nodeMap[loc] = [tourId, locationId]))
        const possibleNodes = getPossibleNodesForInsertion(tours, node, instance, parameters);

        if (possibleNodes.length) {
            const inserts = possibleNodes.map(possibleNode => getEvaluationForFakeInsertAfterNode(tours, node, possibleNode, nodeMap, instance)).sort((a, b) => a.cost - b.cost);
            const feasibleInserts = inserts.filter(x => x.feasible);
            if (parameters.recrerateAllowInfeasibleInsert && inserts.length) {
                let best = inserts[0];
                // best.tours = removeEmptyTours(best.tours)
                return best;
            }
            else {
                if (feasibleInserts.length) {
                    let best = feasibleInserts[0]
                    // best.tours = removeEmptyTours(best.tours)
                    return best
                }
            }
        }
        tours.push([node]);
        // tours = removeEmptyTours(tours);
        return Evaluator.evaluate(tours, instance);
    }

    function removeEmptyTours(tours: Tour[]): Tour[] {
        tours = cloneDeep(tours)
        let emptyTourIndices = tours.map((tour, i) => {
            return { tour, i }
        }).filter(x => x.tour.length == 0).map(x => x.i)
        emptyTourIndices.reverse().forEach(x => {
            tours.splice(x, 1)
        })
        return tours;
    }
}