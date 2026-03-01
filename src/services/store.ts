import { supabase } from './supabaseClient';

export interface BusinessProfile {
    name: string;
    type: string;
    address: string;
    staffCount: number;
    peakHours: string;
    primaryPainPoint: string;
}

export function saveProfile(profile: BusinessProfile) {
    localStorage.setItem('looppulse_profile', JSON.stringify(profile));

    // Sync to Supabase in the background if configured
    if (supabase) {
        supabase.from('profiles').upsert([{
            name: profile.name,
            type: profile.type,
            address: profile.address,
            staff_count: profile.staffCount,
            peak_hours: profile.peakHours,
            primary_pain_point: profile.primaryPainPoint,
            updated_at: new Date().toISOString() // Assumes 'name' is unique constraint, otherwise just inserts
        }]).then(({ error }: any) => {
            if (error) console.error("Supabase sync error for profile:", error);
        });
    }
}

export function getProfile(): BusinessProfile | null {
    const p = localStorage.getItem('looppulse_profile');
    return p ? JSON.parse(p) : null;
}

export function clearProfile() {
    localStorage.removeItem('looppulse_profile');
}

export function saveApiKey(key: string) {
    localStorage.setItem('looppulse_apikey', key);
}

export function getApiKey(): string {
    // Return stored key or a mock one for demo if none exists.
    return localStorage.getItem('looppulse_apikey') || 'mock_key_for_demo';
}

export interface Alert {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    reasoning?: string;
}

export function saveAlert(alert: Alert) {
    const alerts = getAlerts();
    alerts.unshift(alert);
    localStorage.setItem('looppulse_alerts', JSON.stringify(alerts));

    // Sync to Supabase in background if configured
    if (supabase) {
        supabase.from('alerts').insert([{
            id: alert.id,
            type: alert.type,
            message: alert.message,
            timestamp: alert.timestamp,
            reasoning: alert.reasoning
        }]).then(({ error }: any) => {
            if (error) console.error("Supabase sync error for alert:", error);
        });
    }
}

export function getAlerts(): Alert[] {
    const a = localStorage.getItem('looppulse_alerts');
    return a ? JSON.parse(a) : [];
}

export function clearAlerts() {
    localStorage.removeItem('looppulse_alerts');
}
