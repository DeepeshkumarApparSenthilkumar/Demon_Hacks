import { saveAlert } from './store';
import type { Alert, BusinessProfile } from './store';

export function runAlertPoller(_profile: BusinessProfile, _onNewAlert: () => void) {
    // Mock background poller
    // For the hackathon demo, we mostly expect the manual trigger to fire alerts.
    const interval = setInterval(() => {
        // In a real app we'd fetch CTA, weather here periodically.
    }, 5 * 60 * 1000);

    return interval;
}

export function triggerDemoAlert(_profile: BusinessProfile, onNewAlert: () => void) {
    const newAlert: Alert = {
        id: Date.now().toString(),
        type: '⚡ SURGE',
        message: "Rally at Daley Plaza: 1,500 people at noon. 3-min walk from you. Call 2 extra staff NOW.",
        timestamp: new Date().toISOString(),
        reasoning: "A sudden rally permit was detected at Daley Plaza. Your location lies directly on the walking path. This increases expected walk-ins by 40%."
    };
    saveAlert(newAlert);
    onNewAlert();
}
