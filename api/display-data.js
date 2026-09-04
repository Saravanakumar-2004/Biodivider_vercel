export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // Extract separate intervals and steps
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

  // Calculate independent elapsed steps based on the unique intervals
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - startEpoch) / 1000);

  const cStepCount = Math.floor(elapsedSec / cIntSec);
  const oStepCount = Math.floor(elapsedSec / oIntSec);

  const currentCO2 = parseFloat((cStart + cStepCount * cStep).toFixed(2));
  const currentO2 = parseFloat((oStart + oStepCount * oStep).toFixed(2));

  // Compression function to ensure string length never exceeds 6 characters
  function formatValue(num, unit) {
    let maxNumLen = 6 - unit.length;
    let strNum = num.toString();

    // If it naturally fits without decimals, return it
    if (strNum.length <= maxNumLen && !strNum.includes('.')) {
      return strNum + unit;
    }

    let val = num;
    let abbr = '';

    // Apply Indian Numbering System formatting
    if (val >= 10000000) { val = val / 10000000; abbr = 'Cr'; }
    else if (val >= 100000) { val = val / 100000; abbr = 'L'; }
    else if (val >= 1000) { val = val / 1000; abbr = 'k'; }

    // Calculate remaining available characters and trim
    let maxValLen = 6 - abbr.length - unit.length;
    let valStr = val.toString().substring(0, maxValLen);
    
    // Clean up trailing decimal points if truncated exactly at the dot
    if (valStr.endsWith('.')) {
        valStr = valStr.slice(0, -1);
    }

    return valStr + abbr + unit;
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
