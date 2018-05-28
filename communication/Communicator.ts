import * as WebSocket from 'ws';
import { Instance } from '../types/Instance';
import { Solution } from '../types/Solution';

export namespace Communicator {
    const wss = new WebSocket.Server({ host: "0.0.0.0", port: 8080 });
    console.log("ws started");
    let connections = [];
    wss.on('connection', con => {
        connections.push(con);
        console.log("new connection")
        con.on("close", () => {
            connections = connections.filter(x => x != con);
            console.log("connection closed")

        })
    });

    export function send(instance: Instance, solution: Solution) {
        const scale = 10;
        const nodes = [];
        for (let key in instance.coords) {
            const v = instance.coords[key]
            nodes.push({ id: key, x: v.x*scale, y: v.y*scale, label: key });
        }
        const edges = [];
        solution.tours.forEach(tour => {
            edges.push({ from: 1, to: tour[0] })
            tour.forEach((node, i) => {
                if (tour[i + 1]) edges.push({ from: node, to: tour[i + 1] })
                else edges.push({ from: node, to: 1 })
            });
        });
        const json = JSON.stringify({nodes,edges});
        connections.forEach(con => {
            con.send(json);
        })
    }

}


