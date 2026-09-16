import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Project, ProjectDetail, ProjectCollaborator, ProjectActivity } from '../types';
import { MinimalHeader } from '../components/navigation/MinimalHeader';
import {
  Users,
  FolderPlus,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  Copy,
  UserPlus,
  ArrowRight,
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink,
  Plus,
  Check
} from 'lucide-react';

export const Collaborate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [shareSuccessId, setShareSuccessId] = useState<number | null>(null);

  // Create Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSatellite, setNewSatellite] = useState('Sentinel-2 MSI (10m)');
  const [newAoi, setNewAoi] = useState('Bengaluru / Karnataka Basin');

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'collaborator' | 'viewer'>('collaborator');
  const [inviting, setInviting] = useState(false);

  // Load Projects List
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const list = await api.getProjects();
      setProjects(list || []);
      if (list && list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load collaborative projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Check URL parameters for direct project or shared project token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projParam = params.get('project');
    if (projParam) {
      setSelectedProjectId(Number(projParam));
    }
  }, [location.search]);

  // Load detailed project when selected
  useEffect(() => {
    if (selectedProjectId) {
      setLoadingDetail(true);
      api.getProjectDetail(selectedProjectId)
        .then((detail) => {
          setProjectDetail(detail);
        })
        .catch((err) => console.error('Failed to load project details:', err))
        .finally(() => setLoadingDetail(false));
    }
  }, [selectedProjectId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api.createProject(newTitle.trim(), newDesc.trim());
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await fetchProjects();
      setSelectedProjectId(created.id);
    } catch (err) {
      console.error('Project creation failed:', err);
      alert('Unable to create project.');
    }
  };

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteEmail.trim()) return;
    try {
      setInviting(true);
      await api.addCollaborator(selectedProjectId, {
        email: inviteEmail.trim(),
        role: inviteRole,
        added_by: 'Lead Analyst'
      });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      // Reload project details
      const detail = await api.getProjectDetail(selectedProjectId);
      setProjectDetail(detail);
    } catch (err) {
      console.error('Failed to invite collaborator:', err);
      alert('Unable to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  const handleShareProject = (projectId: number) => {
    const shareUrl = `${window.location.origin}/collaborate?project=${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    setShareSuccessId(projectId);
    setTimeout(() => setShareSuccessId(null), 2500);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setProjectDetail(null);
      }
    } catch (err) {
      console.error('Delete project failed:', err);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#FBFDFB] text-[#17201B] font-sans flex flex-col select-none overflow-x-hidden">
      <MinimalHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE5] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Collaborative Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17201B] tracking-tight">
              Shared Projects & Team Investigations
            </h1>
            <p className="text-xs sm:text-sm text-[#66736B] mt-1">
              Collaborate on satellite analyses, share bi-temporal change studies, assign analyst roles, and track live project activity timelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Projects List & Active Project Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: MY PROJECTS (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#66736B] uppercase tracking-wider">
                My Projects ({projects.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 rounded-2xl bg-white border border-[#E3EAE5] text-center text-xs text-[#66736B]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#167A4A] mb-2" />
                Loading workspace projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#E3EAE5] text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#167A4A] flex items-center justify-center mx-auto">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#17201B]">No shared projects yet</div>
                <p className="text-xs text-[#66736B]">Create your first collaborative investigation to share satellite analyses with team members.</p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#167A4A] text-white text-xs font-bold"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {projects.map((p) => {
                  const isSelected = selectedProjectId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#EAF7F0]/30 border-[#167A4A] shadow-xs'
                          : 'bg-white border-[#E3EAE5] hover:border-[#CBD8D0]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-[#17201B]">
                            {p.name}
                          </h3>
                          <p className="text-xs text-[#66736B] line-clamp-2 mt-0.5">
                            {p.description || 'Earth observation investigation.'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#167A4A] shrink-0 border border-[#167A4A]/20">
                          {p.status || 'Active'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#66736B] pt-1 border-t border-[#E3EAE5]/60 font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-[#167A4A]" />
                          {p.satellite_data || 'Sentinel-2'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#66736B]" />
                          {p.collaborator_count || 1} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          {p.analysis_count || 0} analyses
                        </span>
                      </div>

                      {/* Quick Card Actions */}
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareProject(p.id);
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-[#E3EAE5] hover:bg-[#F4F6F5] text-[#17201B] flex items-center gap-1"
                        >
                          {shareSuccessId === p.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#167A4A]" />
                              <span className="text-[#167A4A]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3 text-[#66736B]" />
                              <span>Share</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(p.id);
                          }}
                          className="p-1 rounded-md text-[#66736B] hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Project Details & Workspace (7 cols) */}
          <div className="lg:col-span-7">
            {loadingDetail ? (
              <div className="p-8 rounded-2xl bg-white border border-[#E3EAE5] text-center text-xs text-[#66736B]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#167A4A] mb-2" />
                Loading study details...
              </div>
            ) : projectDetail ? (
              <div className="bg-white rounded-2xl border border-[#E3EAE5] shadow-xs p-5 sm:p-6 space-y-6">
                {/* Project Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE5] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#167A4A] text-white font-bold uppercase">
                        Active Workspace
                      </span>
                      <span className="text-xs text-[#66736B]">
                        Created {new Date(projectDetail.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[#17201B] mt-1">
                      {projectDetail.name}
                    </h2>
                    <p className="text-xs text-[#66736B] mt-0.5">
                      {projectDetail.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareProject(projectDetail.id)}
                      className="px-3 py-1.5 rounded-lg border border-[#E3EAE5] bg-white hover:bg-[#F4F6F5] text-xs font-semibold text-[#17201B] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      {shareSuccessId === projectDetail.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#167A4A]" />
                          <span className="text-[#167A4A]">Share Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-[#66736B]" />
                          <span>Share Project</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite Member</span>
                    </button>
                  </div>
                </div>

                {/* Project Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3EAE5]">
                    <span className="text-[10px] font-mono uppercase text-[#66736B] block">Satellite Sensor</span>
                    <span className="font-bold text-[#17201B] mt-0.5 block">{projectDetail.satellite_data || 'Sentinel-2'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3EAE5]">
                    <span className="text-[10px] font-mono uppercase text-[#66736B] block">Analysis Period</span>
                    <span className="font-bold text-[#17201B] mt-0.5 block">{projectDetail.period || '2023 → 2026'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3EAE5]">
                    <span className="text-[10px] font-mono uppercase text-[#66736B] block">Study AOI</span>
                    <span className="font-bold text-[#17201B] mt-0.5 block truncate">{projectDetail.aoi || 'Dublin Urban'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3EAE5]">
                    <span className="text-[10px] font-mono uppercase text-[#66736B] block">Team Members</span>
                    <span className="font-bold text-[#17201B] mt-0.5 block">{projectDetail.collaborators?.length || 1} Analysts</span>
                  </div>
                </div>

                {/* Collaborator Roles Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#17201B] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#167A4A]" />
                      Project Collaborators & Roles
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {projectDetail.collaborators && projectDetail.collaborators.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-[#E3EAE5] bg-[#FBFDFB] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center font-bold text-xs text-[#167A4A]">
                            {c.user_name ? c.user_name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#17201B]">{c.user_name || c.user_email}</div>
                            <div className="text-[10.5px] text-[#66736B] truncate">{c.user_email}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.role === 'owner'
                            ? 'bg-[#167A4A] text-white'
                            : c.role === 'collaborator'
                            ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20'
                            : 'bg-[#F4F6F5] text-[#66736B]'
                        }`}>
                          {c.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Project Activity Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#17201B] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#167A4A]" />
                      Project Activity Timeline
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAFC] space-y-3">
                    {projectDetail.activities && projectDetail.activities.length > 0 ? (
                      projectDetail.activities.slice(0, 5).map((act, idx) => (
                        <div key={act.id || idx} className="flex items-start gap-2.5 text-xs">
                          <div className="w-2 h-2 rounded-full bg-[#167A4A] mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold text-[#17201B]">
                              <strong className="text-[#167A4A]">{act.user_name}</strong> {act.action}
                            </div>
                            {act.details && (
                              <p className="text-[11px] text-[#66736B] mt-0.5">{act.details}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-[#66736B] shrink-0">
                            {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#66736B] text-center py-2">
                        No recorded activity yet. Run an analysis or save a study to see updates.
                      </div>
                    )}
                  </div>
                </div>

                {/* Attached Analyses */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#17201B] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#167A4A]" />
                      Attached Studies & Queries ({projectDetail.analyses?.length || 0})
                    </h3>
                  </div>

                  {projectDetail.analyses && projectDetail.analyses.length > 0 ? (
                    <div className="space-y-2">
                      {projectDetail.analyses.map((a) => (
                        <div
                          key={a.id}
                          className="p-3.5 rounded-xl border border-[#E3EAE5] bg-white hover:bg-[#FBFDFB] transition flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#17201B]">{a.title}</div>
                            <p className="text-[11px] text-[#66736B] line-clamp-1 mt-0.5">{a.summary}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/app?session=${a.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] hover:bg-[#167A4A] text-[#167A4A] hover:text-white font-bold transition flex items-center gap-1 shrink-0"
                          >
                            <span>Open In Workstation</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAFC] text-center text-xs text-[#66736B]">
                      No analysis sessions attached to this project yet. Use "Save to Project" in Analyze or Compare to link findings.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-[#E3EAE5] text-center text-xs text-[#66736B]">
                Select a project from the left panel to inspect team members, activity timeline, and satellite datasets.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreateProject} className="bg-white border border-[#E3EAE5] rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 text-[#17201B] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-[#17201B]">Create Collaborative Project</h3>
            <div>
              <label className="text-xs font-bold text-[#17201B] block mb-1">Project Name</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Coastal Sea Wall Erosion Study"
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none focus:border-[#167A4A]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17201B] block mb-1">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe project objectives and team milestones..."
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none focus:border-[#167A4A]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#17201B] block mb-1">Satellite Constellation</label>
                <select
                  value={newSatellite}
                  onChange={(e) => setNewSatellite(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none"
                >
                  <option value="Sentinel-2 MSI (10m)">Sentinel-2 MSI (10m Optical)</option>
                  <option value="Sentinel-1 C-SAR (Radar)">Sentinel-1 C-SAR (Radar)</option>
                  <option value="Joint Optical + SAR">Joint Optical + SAR Fusion</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#17201B] block mb-1">Area of Interest</label>
                <input
                  type="text"
                  value={newAoi}
                  onChange={(e) => setNewAoi(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE5]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-[#E3EAE5] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#167A4A] text-white text-xs font-bold hover:bg-[#13673E]"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleInviteCollaborator} className="bg-white border border-[#E3EAE5] rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 text-[#17201B] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-[#17201B]">Invite Collaborator</h3>
            <div>
              <label className="text-xs font-bold text-[#17201B] block mb-1">Analyst Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="analyst@isro.gov.in"
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none focus:border-[#167A4A]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17201B] block mb-1">Role Permissions</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none"
              >
                <option value="collaborator">COLLABORATOR — Can analyze, query, generate reports</option>
                <option value="viewer">VIEWER — Read-only access to maps & reports</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE5]">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-[#E3EAE5] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 rounded-lg bg-[#167A4A] text-white text-xs font-bold hover:bg-[#13673E] disabled:opacity-50 flex items-center gap-1.5"
              >
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>Send Invitation</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
