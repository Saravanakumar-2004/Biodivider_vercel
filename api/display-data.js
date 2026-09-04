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

  const rawCO2 = parseFloat((cStart + cStepCount * cStep).toFixed(2));
  const rawO2 = parseFloat((oStart + oStepCount * oStep).toFixed(2));

  function formatValue(num, unit = '') {
    let val = num;
    let abbr = '';

    if (val >= 10000000) { val = val / 10000000; abbr = 'Cr'; }
    else if (val >= 100000) { val = val / 100000; abbr = 'L'; }
    else if (val >= 1000) { val = val / 1000; abbr = 'k'; }

    // This safely keeps a maximum of 2 decimals and automatically drops trailing zeros
    let strNum = parseFloat(val.toFixed(2)).toString();

    let maxAvailable = 6 - abbr.length - unit.length;
    let finalStr = strNum.substring(0, maxAvailable);
    
    // If the 6-character truncation slices a number and leaves a trailing "." or "0", this cleans it up
    finalStr = parseFloat(finalStr).toString();
    
    return finalStr + abbr + unit;
  }

  return res.status(200).json({
    status: "online",
    co2: formatValue(rawCO2, ''),
    o2: formatValue(rawO2, ''),
    co2_formatted: formatValue(rawCO2, 'g'),
    o2_formatted: formatValue(rawO2, 'l'),
    co2_interval_seconds: cIntSec,
    o2_interval_seconds: oIntSec,
    timestamp: new Date().toISOString()
  });
}
