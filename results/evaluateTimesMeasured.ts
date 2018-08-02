const results = require('./timesMeasured.json')
console.log('costs');
console.log('avg',avg(results.costs.map(x=>x[0])))
console.log('sd',standardDev(results.costs.map(x=>x[0])))
console.log('times');
console.log('avg',avg(results.times.map(x=>x[0])))
console.log('sd',standardDev(results.times.map(x=>x[0])))

function avg(xs: number[]) {
    return xs.reduce((a, x) => a + x) / xs.length;
}
function roundedAvg(xs: number[]) {
    return Math.round(avg(xs));
}
function standardDev(xs: number[]) {
    const average = avg(xs);
    const sumOfSquares = xs.reduce((a, x) => {
        a += Math.pow(x - average, 2);
        return a;
    }, 0)
    return Math.sqrt(sumOfSquares / xs.length)
}

