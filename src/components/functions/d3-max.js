export const fredUnits = {
    lin: "levels",
    chg: "change",
    ch1: "change from year ago",
    pch: "percent change",
    pc1: "percent change from year ago",
    pca: "compounded annual rate of change",
    cch: "contiously compounded rate of change",
    cca: "continously compounded annual rate of change",
    log: "natural log"
}

export function template(strings, ...keys) {
    return (function(...values) {
      let dict = values[values.length - 1] || {};
      let result = [strings[0]];
      keys.forEach(function(key, i) {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join('');
    });
  }