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
    let integerPart = Math.floor(num).toString();

    // 1. If it naturally fits within the 6-character limit (e.g., 99999g is 6 chars)
    if (integerPart.length + unit.length <= 6) {
      let strNum = Number(num).toLocaleString('fullwide', {useGrouping: false, maximumFractionDigits: 2});
      
      if (strNum.length + unit.length <= 6) {
        return strNum + unit;
      } else {
        // Truncate decimals to force it to fit exactly 6 chars
        let allowedLen = 6 - unit.length;
        let truncated = strNum.substring(0, allowedLen);
        if (truncated.endsWith('.')) truncated = truncated.slice(0, -1);
        return truncated + unit;
      }
    }

    // 2. If it exceeds 6 characters, force Indian numbering compression
    let val = num;
    let abbr = '';

    if (val >= 10000000) { val = val / 10000000; abbr = 'Cr'; }
    else if (val >= 100000) { val = val / 100000; abbr = 'L'; }
    else if (val >= 1000) { val = val / 1000; abbr = 'k'; }

    let abbrStr = Number(val).toLocaleString('fullwide', {useGrouping: false, maximumFractionDigits: 2});
    
    // 3. Calculate exactly how many characters we have left for the numbers
    let maxAvailable = 6 - abbr.length - unit.length;

    // 4. Brutally slice off anything that exceeds the available space
    let finalStr = abbrStr.substring(0, maxAvailable);
    if (finalStr.endsWith('.')) {
      finalStr = finalStr.slice(0, -1);
    }

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
