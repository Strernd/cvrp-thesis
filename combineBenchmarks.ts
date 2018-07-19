const fs = require('fs');

const getResultsFor = n => {
    const contentForR = r => {
        return fs.readFileSync('./master-process/results/lambdaBenchmark_n' + n + '_r' + r + '.json');
    }
    let contents = [];
    for (let i = 1; i <= 10; i++) {
        contents.push(contentForR(i));
    }
    contents = contents.map(x => JSON.parse(x))
    return contents.reduce((a, x) => {
        a.push(...x);
        return a;
    }, [])
}

const data = [];
for (let i = 1; i <= 9; i++) {
    const results = getResultsFor(i*10);
    data.push({
        times: results.map(x => x.time),
        costs: results.map(x => x.cost),
        lambdas: i * 10
    })
}
fs.writeFileSync('./templates/lambdas_10to90.json',JSON.stringify(data));