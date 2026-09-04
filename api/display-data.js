export default function handler(req, res) {
  // Allow HDPlayer and external devices to fetch data
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const {
    interval = 3,
    co2_start = 0.0,
    co2_step = 0.2,
    o2_start = 20.9,
    o2_step = 0.1,
    epoch = 0
  } = req.query;

  const intervalSec = Math.max(0.1, parseFloat(interval));
  const cStart = parseFloat(co2_start);
  const cStep = parseFloat(co2_step);
  const oStart = parseFloat(o2_start);
  const oStep = parseFloat(o2_step);
  const startEpoch = parseInt(epoch, 10) || 0;

  // Calculate elapsed time from the anchor epoch
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - startEpoch) / 1000);
  const currentStep = Math.floor(elapsedSec / intervalSec);

  const currentCO2 = parseFloat((cStart + currentStep * cStep).toFixed(2));
  const currentO2 = parseFloat((oStart + currentStep * oStep).toFixed(2));

  return res.status(200).json({
    status: "online",
    co2: currentCO2,
    o2: currentO2,
    co2_formatted: `${currentCO2}%`,
    o2_formatted: `${currentO2}%`,
    interval_seconds: intervalSec,
    step_index: currentStep,
    timestamp: new Date().toISOString()
  });
}