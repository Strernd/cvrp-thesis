import { Tour } from "../types/Tour";
import { Edges } from "../types/Edges";

export namespace Transformator {
    export function locationsToEdges(tours: Tour[]): Edges {
        const edges = [];
        tours.forEach(tour => {
            edges.push([0, tour[0]])
            tour.forEach((l, i) => {
                const next = tour[i + 1]
                if (next) edges.push([l, next]);
            })
            edges.push([tour[tour.length - 1], 0])
        });
        return edges;
    }
}