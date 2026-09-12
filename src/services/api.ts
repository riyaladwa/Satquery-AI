import axios from 'axios';
import {
  ImageRecord,
  QualityCheckResult,
  AnalyzeResponse,
  Project,
  AreaCalculationResult,
  ReportItem,
  ModelItem,
  PixelInspectionResult,
  SceneCard,
  TimeSeriesData,
  HistorySession,
  SessionDetail
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = `${BASE_URL}/api`;

export const resolveAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const api = {
  async getHealth() {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  async getProjects(): Promise<Project[]> {
    const res = await axios.get(`${API_BASE}/projects`);
    return res.data;
  },

  async createProject(name: string, description?: string): Promise<Project> {
    const res = await axios.post(`${API_BASE}/projects`, { name, description });
    return res.data;
  },

  async getImages(): Promise<ImageRecord[]> {
    const res = await axios.get(`${API_BASE}/images`);
    return res.data;
  },

  async getImage(id: string): Promise<ImageRecord> {
    const res = await axios.get(`${API_BASE}/images/${id}`);
    return res.data;
  },

  async uploadImage(formData: FormData): Promise<ImageRecord> {
    const res = await axios.post(`${API_BASE}/images/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async validateImage(id: string): Promise<QualityCheckResult> {
    const res = await axios.get(`${API_BASE}/images/${id}/validate`);
    return res.data;
  },

  async inspectPixel(imageId: string, lat: number, lon: number): Promise<PixelInspectionResult> {
    const res = await axios.get(`${API_BASE}/pixel/inspect`, {
      params: { image_id: imageId, lat, lon }
    });
    return res.data;
  },

  async searchScenes(filters?: {
    satellite?: string;
    date_from?: string;
    date_to?: string;
    max_cloud?: number;
    query?: string;
    resolution?: string;
  }): Promise<SceneCard[]> {
    const res = await axios.get(`${API_BASE}/scenes/search`, { params: filters });
    return res.data;
  },

  async getTimeSeries(params?: {
    image_id?: string;
    tile?: string;
    lat?: number;
    lon?: number;
  }): Promise<TimeSeriesData> {
    const res = await axios.get(`${API_BASE}/timeseries`, { params });
    return res.data;
  },

  async analyze(payload: {
    image_id: string;
    query: string;
    secondary_image_id?: string;
    session_id?: string;
    language?: string;
    source?: string;
  }): Promise<AnalyzeResponse> {
    const res = await axios.post(`${API_BASE}/analyze`, payload);
    return res.data;
  },

  async compareBitemporal(imageAId: string, imageBId: string, customType = 'urban') {
    const res = await axios.get(
      `${API_BASE}/compare/bitemporal?image_a_id=${imageAId}&image_b_id=${imageBId}&custom_type=${customType}`
    );
    return res.data;
  },

  async compareOpticalSar(opticalId: string, sarId: string) {
    const res = await axios.get(
      `${API_BASE}/compare/optical-sar?optical_id=${opticalId}&sar_id=${sarId}`
    );
    return res.data;
  },

  async calculateArea(coordinates: [number, number][]): Promise<AreaCalculationResult> {
    const res = await axios.post(`${API_BASE}/area/calculate`, { coordinates });
    return res.data;
  },

  async generateReport(payload: {
    image_id: string;
    query: string;
    answer_en: string;
    confidence_score: number;
    reliability_score: string;
    task_type: string;
    model_name: string;
    evidence_regions: any[];
    secondary_image_id?: string;
    project_name?: string;
  }): Promise<ReportItem> {
    const res = await axios.post(`${API_BASE}/reports/generate`, payload);
    return res.data;
  },

  async listReports(): Promise<ReportItem[]> {
    const res = await axios.get(`${API_BASE}/reports`);
    return res.data;
  },

  async getReport(id: string): Promise<ReportItem> {
    const res = await axios.get(`${API_BASE}/reports/${id}`);
    return res.data;
  },

  async deleteReport(id: string) {
    const res = await axios.delete(`${API_BASE}/reports/${id}`);
    return res.data;
  },

  async downloadReportBlob(reportId: string, filename?: string) {
    const res = await axios.get(`${API_BASE}/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || `${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 100);
    return true;
  },

  async getModels(): Promise<{ models: ModelItem[]; total_active: number; orchestrator_status: string }> {
    const res = await axios.get(`${API_BASE}/models`);
    return res.data;
  },

  async getSessions(): Promise<HistorySession[]> {
    const res = await axios.get(`${API_BASE}/history/sessions`);
    return res.data;
  },

  async getSessionDetail(id: string): Promise<SessionDetail> {
    const res = await axios.get(`${API_BASE}/history/sessions/${id}`);
    return res.data;
  },

  async deleteSession(id: string) {
    const res = await axios.delete(`${API_BASE}/history/sessions/${id}`);
    return res.data;
  },

  async getUserSettings(userId?: string) {
    const res = await axios.get(`${API_BASE}/settings`, {
      params: userId ? { user_id: userId } : {}
    });
    return res.data;
  },

  async updateUserSettings(settings: {
    user_id?: string;
    preferred_language?: string;
    default_basemap?: string;
    confidence_threshold?: number;
    auto_generate_reports?: boolean;
    notification_preferences?: Record<string, any>;
  }) {
    const res = await axios.put(`${API_BASE}/settings`, settings);
    return res.data;
  }
};

