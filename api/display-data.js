export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const {
    org = "Carbelim",
    device_id = "DEV-01",
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
    let val = num;
    let abbr = '';

    if (val >= 10000000) { val = val / 10000000; abbr = 'Cr'; }
    else if (val >= 100000) { val = val / 100000; abbr = 'L'; }
    else if (val >= 1000) { val = val / 1000; abbr = 'k'; }

    // Forces standard decimal formatting, blocking 'e' scientific notation completely
    let valStr = Number(val).toLocaleString('en-US', { 
      useGrouping: false, 
      maximumFractionDigits: 2 
    });

    let maxValLen = 6 - abbr.length - unit.length;
    valStr = valStr.substring(0, maxValLen);
    
    if (valStr.endsWith('.')) {
        valStr = valStr.slice(0, -1);
    }

    return valStr + abbr + unit;
  }

  return res.status(200).json({
    status: "online",
    organization: org,
    device_id: device_id,
    co2: currentCO2,
    o2: currentO2,
    co2_formatted: formatValue(currentCO2, 'g'),
    o2_formatted: formatValue(currentO2, 'l'),
    timestamp: new Date().toISOString()
  });
}
