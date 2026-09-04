export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const {
    co2_interval = 5,
    o2_interval = 5,
    co2_start = 0,
    co2_step = 5,
    o2_start = 0,
    o2_step = 10,
    epoch = 0
  } = req.query;

  const cIntSec = Math.max(0.1, parseFloat(co2_interval));
  const oIntSec = Math.max(0.1, parseFloat(o2_interval));
  const cStart = parseFloat(co2_start);
  const cStep = parseFloat(co2_step);
  const oStart = parseFloat(o2_start);
  const oStep = parseFloat(o2_step);
  const startEpoch = parseInt(epoch, 10) || 0;

  const now = Date.now();
  const elapsedSec = Math.max(0, (now - startEpoch) / 1000);

  const cStepCount = Math.floor(elapsedSec / cIntSec);
  const oStepCount = Math.floor(elapsedSec / oIntSec);

  const currentCO2 = parseFloat((cStart + cStepCount * cStep).toFixed(2));
  const currentO2 = parseFloat((oStart + oStepCount * oStep).toFixed(2));

  function formatValue(num, unit) {
    // 1. Keep decimals for numbers under 1,000 (e.g., 0.2g, 999.5l)
    if (num < 1000) {
      let strNum = Number(num).toLocaleString('fullwide', {useGrouping: false, maximumFractionDigits: 2});
      let allowedLen = 6 - unit.length;
      if (strNum.length <= allowedLen) return strNum + unit;
      
      let truncated = strNum.substring(0, allowedLen);
      if (truncated.endsWith('.')) truncated = truncated.slice(0, -1);
      return truncated + unit;
    }

    // 2. Drop decimals for large numbers to guarantee space (e.g., 15Lg instead of 15.6Lg)
    let val = num;
    let abbr = '';

    if (val >= 10000000) { val = Math.floor(val / 10000000); abbr = 'Cr'; }
    else if (val >= 100000) { val = Math.floor(val / 100000); abbr = 'L'; }
    else if (val >= 1000) { val = Math.floor(val / 1000); abbr = 'k'; }

    let str = val.toString();
    let maxAvailable = 6 - abbr.length - unit.length;
    let finalStr = str.substring(0, maxAvailable);
    
    return finalStr + abbr + unit;
  }

  return res.status(200).json({
    status: "online",
    co2: currentCO2,
    o2: currentO2,
    co2_formatted: formatValue(currentCO2, 'g'),
    o2_formatted: formatValue(currentO2, 'l'),
    co2_interval_seconds: cIntSec,
    o2_interval_seconds: oIntSec,
    timestamp: new Date().toISOString()
  });
}
