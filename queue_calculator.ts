const memo = [];


const c = 170; //servers
const lambda = 277.77// arrival rate
const mu = 1.881 // services p m
const rho = lambda / (c * mu);

const getP0 = (c, rho) => {
    let sum = 0;
    for (let n = 0; n < c; n++) {
        sum += ((c * rho) ** n) / factorial(n) + (((c * rho) ** c) / factorial(c) * (1 / (1 - rho)))
    }
    return sum ** -1;
}

const getLQ = (c, rho, p0) => {
    return p0 * ((c ** c * rho ** (c + 1)) / factorial(c) * (1 - rho) ** 2)
}
const p0 = getP0(c, rho);
const LQ = getLQ(c, rho, p0);
const WQ = LQ / lambda;
const WS = WQ + (1 / mu);
const LS = LQ + (1 / mu);

console.log({ lambda, mu, c, rho, p0, LQ, WQ, WS, LS })



function factorial(n) {
    if (n == 0 || n == 1) return 1;
    if (memo[n] && memo[n] > 0) return memo[n];
    return memo[n] = factorial(n - 1) * n;
} ​