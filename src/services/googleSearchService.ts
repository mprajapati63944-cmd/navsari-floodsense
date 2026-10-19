export interface GoogleSource {
  title: string;
  uri: string;
}

export interface GoogleSearchWeatherResponse {
  success: boolean;
  summary: string;
  searchQueries: string[];
  sources: GoogleSource[];
  timestamp: string;
  error?: string;
}

export interface GoogleSearchFloodRiskResponse {
  success: boolean;
  analysis: string;
  searchQueries: string[];
  sources: GoogleSource[];
  timestamp: string;
  error?: string;
}

export async function fetchGoogleSearchWeather(): Promise<GoogleSearchWeatherResponse> {
  try {
    const res = await fetch('/api/google-search-weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      summary: '',
      searchQueries: [],
      sources: [],
      timestamp: new Date().toISOString(),
      error: err.message || 'Failed to fetch Google Search grounded data',
    };
  }
}

export async function fetchGoogleSearchFloodRisk(
  location: string,
  rainfallMm: number,
  durationHours: number
): Promise<GoogleSearchFloodRiskResponse> {
  try {
    const res = await fetch('/api/google-search-flood-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, rainfallMm, durationHours }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      analysis: '',
      searchQueries: [],
      sources: [],
      timestamp: new Date().toISOString(),
      error: err.message || 'Failed to fetch Google Search flood analysis',
    };
  }
}
