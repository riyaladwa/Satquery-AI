import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  Upload,
  MessageSquare,
  Cpu,
  CheckCircle2,
  Eye,
  Crosshair,
  GitCompare,
  Radar,
  Layers,
  Ruler,
  Waves,
  Sprout,
  Building2,
  Map,
  Flame,
  Clock,
  FileText,
  Mic,
  Globe,
  ShieldCheck,
  Volume2
} from 'lucide-react';

export const MinimalLanding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const howItWorksSteps = [
    {
      num: '01',
      title: 'UPLOAD',
      desc: 'Upload optical, multispectral, or SAR satellite imagery in GeoTIFF or standard formats.',
      icon: Upload
    },
    {
      num: '02',
      title: 'ASK',
      desc: 'Ask any natural-language question using text or voice dictation in your preferred language.',
      icon: MessageSquare
    },
    {
      num: '03',
      title: 'ANALYZE',
      desc: 'SatQuery automatically determines intent, inspects modalities, and orchestrates specialist AI models.',
      icon: Cpu
    },
    {
      num: '04',
      title: 'UNDERSTAND',
      desc: 'Receive spatial visual evidence, localized explanations, audio playback, confidence, and PDF reports.',
      icon: CheckCircle2
    }
  ];

  const capabilities = [
    {
      title: '1. Interactive Satellite Map',
      desc: 'Pan, zoom, high-resolution satellite imagery, and dynamic AI-grounded vector overlays.',
      icon: Map,
      query: 'What is visible in this image?'
    },
    {
      title: '2. AI Change Heatmap',
      desc: 'Bi-temporal difference mapping with change heatmaps and hectare footprint deltas.',
      icon: Flame,
      query: 'What changed between these images?'
    },
    {
      title: '3. Query-Based Object Highlighting',
      desc: 'Segment and highlight ground targets directly on the satellite map from text queries.',
      icon: Crosshair,
      query: 'Highlight the water bodies'
    },
    {
      title: '4. Land Cover Classification',
      desc: 'Multi-class semantic identification across water, vegetation, agriculture, and built-up surfaces.',
      icon: Layers,
      query: 'Classify land cover distribution'
    },
    {
      title: '5. Optical vs SAR Comparison',
      desc: 'Joint cross-sensor analysis combining Sentinel-2 optical bands with Sentinel-1 radar backscatter.',
      icon: Radar,
      query: 'Compare these optical and SAR images'
    },
    {
      title: '6. AI Explanation & Evidence Panel',
      desc: 'Explainable answers grounded in calibrated reflectance, spatial coordinates, and vector bounds.',
      icon: Eye,
      query: 'What is visible in this image?'
    },
    {
      title: '7. Agent Execution Timeline',
      desc: 'Compact observable audit trail tracking query understanding, model routing, and evidence generation.',
      icon: Cpu,
      query: 'Are there buildings?'
    },
    {
      title: '8. Multiple Questions on Same Image',
      desc: 'Continuous conversational thread on the uploaded satellite scene without re-uploading.',
      icon: MessageSquare,
      query: 'What is visible here?'
    },
    {
      title: '9. Conversation History',
      desc: 'Persistent analysis archive with query timestamps, languages, and one-click session restore.',
      icon: Clock,
      query: 'Highlight buildings'
    },
    {
      title: '10. Area Calculation',
      desc: 'WGS-84 geodetic measurements providing exact hectare and square-kilometer calculations.',
      icon: Ruler,
      query: 'Calculate the water area'
    },
    {
      title: '11. Disaster Analysis Mode',
      desc: 'All-weather radar flood inundation mapping and post-event structural impact detection.',
      icon: Waves,
      query: 'Identify flood-affected areas'
    },
    {
      title: '12. Agriculture Monitoring',
      desc: 'Crop canopy vigor tracking, NDVI vegetation monitoring, and parcel boundaries.',
      icon: Sprout,
      query: 'Identify agricultural areas'
    },
    {
      title: '13. Urban Growth Analysis',
      desc: 'Detect city expansion, transit arteries, and concrete density increases between dates.',
      icon: Building2,
      query: 'Has this city expanded between 2023 and 2026?'
    },
    {
      title: '14. Automatic PDF Report',
      desc: 'One-click publication-grade PDF briefings with metadata, evidence tables, and telemetry.',
      icon: FileText,
      query: 'Is there a water body?'
    },
    {
      title: '15. Confidence + Reliability Score',
      desc: 'Calibrated radiometric confidence percentages and explainable reliability ratings.',
      icon: ShieldCheck,
      query: 'Are there buildings?'
    },
    {
      title: '16. Smart Query Suggestions',
      desc: 'Context-aware prompt suggestions tailored to single, bi-temporal, and radar scene configurations.',
      icon: Sparkles,
      query: 'Are there any water bodies?'
    },
    {
      title: '17. Voice Command',
      desc: 'Native microphone dictation converting natural speech into precise spatial queries.',
      icon: Mic,
      query: 'Show agricultural areas'
    },
    {
      title: '18. Multilingual Viewer',
      desc: 'Synchronized text explanations and voice audio playback across 8 Indian languages.',
      icon: Globe,
      query: 'Is there a water body in this scene?'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#17201B] font-sans selection:bg-[#EAF7F0] selection:text-[#167A4A]">
      {/* Public Header */}
      <PublicHeader />

      {/* 1. Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('heroTag')}</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#17201B] leading-[1.15]">
            {t('heroHeading')}
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#66736B] leading-relaxed max-w-2xl mx-auto font-normal">
            {t('heroSubtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#167A4A] hover:bg-[#13673E] text-white text-sm font-semibold transition-all shadow-sm shadow-[#167A4A]/20 cursor-pointer"
              type="button"
            >
              <span>{t('startAnalyzing')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('capabilities');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FBFDFB] text-[#17201B] text-sm font-semibold border border-[#E3EAE5] transition-all cursor-pointer"
              type="button"
            >
              <span>{t('exploreSatQuery')}</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#E3EAE5] bg-[#FBFDFB] p-3 sm:p-5 shadow-sm">
          <div className="rounded-xl overflow-hidden border border-[#E3EAE5] bg-white relative">
            {/* Top Mock Window Bar */}
            <div className="h-10 bg-[#FBFDFB] border-b border-[#E3EAE5] px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="ml-2 font-mono text-[11px] text-[#66736B]">Sentinel-2 MSI • 10m GSD</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#167A4A] bg-[#EAF7F0] px-2.5 py-0.5 rounded-full border border-[#167A4A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#167A4A] animate-pulse" />
                <span>AI Grounded</span>
              </div>
            </div>

            {/* Split Visual Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Map Preview Graphic */}
              <div className="lg:col-span-7 bg-slate-100 relative overflow-hidden flex items-center justify-center p-6">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-85"
                  style={{
                    backgroundImage: `url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3055/4946')`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />

                {/* Grounded Polygon Highlight Overlay */}
                <div className="relative z-10 border-2 border-[#167A4A] bg-[#2E9B68]/30 rounded-lg p-4 max-w-xs backdrop-blur-2xs shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
                    <span>Grounded Estuary / Water Body</span>
                    <span className="bg-[#167A4A] px-1.5 py-0.5 rounded text-[10px]">95.8% Conf</span>
                  </div>
                  <div className="text-[10.5px] text-white/90 font-mono">
                    Area: 351.42 ha (3.51 km²)
                  </div>
                </div>
              </div>

              {/* AI Query & Response Preview Panel */}
              <div className="lg:col-span-5 p-5 bg-white flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-[#E3EAE5]">
                {/* Simulated Query Box */}
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[#66736B]">
                    Natural Language Query
                  </div>
                  <div className="p-3 rounded-lg bg-[#FBFDFB] border border-[#E3EAE5] text-xs font-semibold text-[#17201B] flex items-center justify-between">
                    <span>"Is there a water body in this scene?"</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#167A4A]" />
                  </div>
                </div>

                {/* Simulated Result */}
                <div className="space-y-2 bg-[#EAF7F0]/40 rounded-xl p-3.5 border border-[#167A4A]/20">
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-[#167A4A] uppercase tracking-wider">
                    <span>AI Result • VQA</span>
                    <span>High Reliability</span>
                  </div>
                  <p className="text-xs text-[#17201B] leading-relaxed font-medium">
                    Yes, a significant open water body is clearly visible in the southwestern quadrant of this Sentinel-2 scene. It covers approximately 351.42 ha (3.51 km²) with 95.8% confidence.
                  </p>
                </div>

                {/* Multimodal Controls Preview */}
                <div className="pt-2 border-t border-[#E3EAE5] flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] font-semibold text-[11px]">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Voice Audio Ready (8 Languages)</span>
                  </div>
                  <button
                    onClick={() => navigate('/app?query=Is%20there%20a%20water%20body%3F')}
                    className="text-xs font-bold text-[#167A4A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Try Query</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Product Overview Section */}
      <section id="product" className="py-20 bg-[#FBFDFB] border-t border-b border-[#E3EAE5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17201B]">
              Satellite Intelligence Made Effortless
            </h2>
            <p className="text-sm sm:text-base text-[#66736B] leading-relaxed">
              No complicated GIS toolbars or manual band calculations. Ask questions naturally and let SatQuery AI deliver explainable scientific results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#E3EAE5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7F0] text-[#167A4A] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17201B]">Natural Language Copilot</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Communicate naturally via text or voice. SatQuery converts queries into precise spatial queries and spectral index operations.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E3EAE5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7F0] text-[#167A4A] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17201B]">Agentic Model Registry</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Fine-tuned BigEarthNet-S2, RSVQA, and dual-stream fusion models autonomously resolve tasks without manual parameter tuning.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E3EAE5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7F0] text-[#167A4A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17201B]">Calibrated Spatial Evidence</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Every claim is grounded with exact geodetic coordinates, surface reflectance metrics, confidence intervals, and official PDF briefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <div className="text-xs uppercase tracking-wider font-bold text-[#167A4A]">
            Simple 4-Step Journey
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#17201B]">
            How SatQuery AI Works
          </h2>
          <p className="text-sm text-[#66736B] leading-relaxed">
            From raw satellite scene to clear insight in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 rounded-xl bg-white border border-[#E3EAE5] hover:border-[#167A4A]/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-bold text-[#167A4A]/80">
                      {step.num}
                    </span>
                    <div className="w-8 h-8 rounded-md bg-[#EAF7F0] text-[#167A4A] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold tracking-wide text-[#17201B]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#66736B] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Capabilities Section */}
      <section id="capabilities" className="py-20 bg-[#FBFDFB] border-t border-b border-[#E3EAE5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <div className="text-xs uppercase tracking-wider font-bold text-[#167A4A]">
              Full-Stack Geospatial Intelligence
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#17201B]">
              Explore Capabilities
            </h2>
            <p className="text-sm text-[#66736B] leading-relaxed">
              Click any capability to immediately test it with live satellite observations in the workstation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate(`/app?query=${encodeURIComponent(cap.query)}`)}
                  className="p-5 rounded-xl bg-white border border-[#E3EAE5] hover:border-[#167A4A] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-[#EAF7F0] text-[#167A4A] group-hover:bg-[#167A4A] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[#17201B] group-hover:text-[#167A4A] transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-[#66736B] leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E3EAE5]/60 flex items-center justify-between text-xs text-[#167A4A] font-semibold">
                    <span>Try: "{cap.query.slice(0, 32)}..."</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="py-20 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#17201B]">
          Ready to query your satellite imagery?
        </h2>
        <p className="text-sm text-[#66736B] max-w-xl mx-auto leading-relaxed">
          Open the SatQuery AI workstation to analyze Sentinel-2 optical scenes, Sentinel-1 radar passes, or your own GeoTIFF imagery.
        </p>
        <div>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#167A4A] hover:bg-[#13673E] text-white text-sm font-semibold transition-all shadow-sm shadow-[#167A4A]/20 cursor-pointer"
            type="button"
          >
            <span>Launch SatQuery AI Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#E3EAE5] text-xs text-[#66736B] text-center">
        <p>SatQuery AI • Multimodal Remote Sensing Vision-Language Platform</p>
      </footer>
    </div>
  );
};
