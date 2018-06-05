import { Instance } from "../types/Instance";
import { Solution } from "../types/Solution";
import { Options } from "../types/Options";
import fetch from 'node-fetch';

const url = 'https://na91108jwf.execute-api.eu-central-1.amazonaws.com/Dev';

export function lambda(instance: Instance, startSolution: Solution, options: Options){
    const body = {instance, startSolution, options};
    return fetch(url, { method: 'POST', body: JSON.stringify(body) })
    .then(res => res.json()).then(x => {
        if(x.body && x.body.result) return x.body.result;
        else{
            console.warn(x);
            return {cost: Number.MAX_VALUE}
        } 
        }
    ).catch(console.warn);
}