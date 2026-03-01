import axios from 'axios';

export const pm25ToRisk = (value) => {
  if (value <= 12)  return 1;
  if (value <= 35)  return 2;
  if (value <= 55)  return 3;
  if (value <= 150) return 4;
  return 5;
};

export const riskToLabel = (risk) =>
  ['', 'Good', 'Moderate', 'Sensitive Groups', 'Unhealthy', 'Hazardous'][risk] || 'Unknown';

export const riskToColor = (risk) => ({
  1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444', 5: '#a855f7'
})[risk] || '#6b7280';

export const fetchChicagoAirQuality = async () => {
  // Wait up to 3 minutes for proxy to finish fetching all 90 sensors
  const MAX_WAIT_MS  = 3 * 60 * 1000;
  const POLL_INTERVAL = 3000;
  const started = Date.now();

  while (true) {
    try {
      const response = await axios.get('http://localhost:3001/api/airquality', {
        timeout: 30000,
      });

      const stations = response.data?.stations || [];
      console.log(`Live stations received: ${stations.length}`);

      // Proxy still fetching — stations will be empty or very few
      if (stations.length === 0 && (Date.now() - started) < MAX_WAIT_MS) {
        console.log('Proxy still fetching — retrying in 3s...');
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        continue;
      }

      // Got real data — return it
      return stations.map(s => {
        const risk = pm25ToRisk(parseFloat(s.pm25));
        return {
          id:        s.location,
          lat:       s.latitude,
          lng:       s.longitude,
          pm25:      s.pm25,
          risk,
          label:     riskToLabel(risk),
          color:     riskToColor(risk),
          source:    'OpenAQ Live',
          parameter: 'PM2.5',
          unit:      'μg/m³',
        };
      });

    } catch (err) {
      console.warn('Proxy unreachable:', err.message);
      // If proxy is completely down, stop waiting
      return [];
    }
  }
};