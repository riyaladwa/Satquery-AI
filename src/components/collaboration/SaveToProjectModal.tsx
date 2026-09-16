import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project } from '../../types';
import { FolderPlus, Check, X, Loader2, Sparkles, Building2 } from 'lucide-react';

interface SaveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  defaultTitle?: string;
  onSaved?: (projectId: number) => void;
}

export const SaveToProjectModal: React.FC<SaveToProjectModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  defaultTitle = 'Satellite Analysis Investigation',
  onSaved
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  
  // New Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSuccess(false);
      api.getProjects()
        .then((list) => {
          setProjects(list || []);
          if (list && list.length > 0) {
            setSelectedProjectId(list[0].id);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      let targetProjId = selectedProjectId;

      if (mode === 'new') {
        if (!newProjectName.trim()) {
          alert('Please enter a project name.');
          setSaving(false);
          return;
        }
        const created = await api.createProject(newProjectName.trim(), newProjectDesc.trim());
        targetProjId = created.id;
      }

      if (!targetProjId) {
        alert('Please select or create a project.');
        setSaving(false);
        return;
      }

      const activeSessId = sessionId || `sess-${Date.now()}`;
      await api.saveAnalysisToProject(targetProjId, {
        session_id: activeSessId,
        title: defaultTitle,
        added_by: 'Lead Analyst'
      });

      setSuccess(true);
      if (onSaved) onSaved(targetProjId);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save to project:', err);
      alert('Unable to save analysis to project. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E3EAE5] rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#17201B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3EAE5] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17201B]">Save Analysis to Project</h3>
              <p className="text-[11px] text-[#66736B]">Collaborate and attach results to a shared workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#66736B] hover:text-[#17201B] p-1 rounded-lg hover:bg-[#F4F6F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Existing vs New */}
        <div className="flex rounded-lg bg-[#F4F6F5] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-1.5 rounded-md transition ${
              mode === 'existing'
                ? 'bg-white text-[#167A4A] shadow-xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B]'
            }`}
          >
            Existing Project
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-1.5 rounded-md transition ${
              mode === 'new'
                ? 'bg-white text-[#167A4A] shadow-xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B]'
            }`}
          >
            + New Project
          </button>
        </div>

        {/* Content */}
        {mode === 'existing' ? (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#17201B] block">Select Workspace Project</label>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-[#66736B] text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#66736B]">
                No projects found. Create your first project below.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedProjectId === p.id
                        ? 'border-[#167A4A] bg-[#EAF7F0]/40 text-[#17201B]'
                        : 'border-[#E3EAE5] bg-white hover:bg-[#FBFDFB] text-[#17201B]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{p.name}</div>
                      <div className="text-[11px] text-[#66736B] truncate max-w-[260px]">
                        {p.description || 'Remote sensing investigation'}
                      </div>
                    </div>
                    {selectedProjectId === p.id && (
                      <Check className="w-4 h-4 text-[#167A4A] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#17201B] block mb-1">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Civic Flood Investigation 2026"
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none focus:border-[#167A4A]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17201B] block mb-1">Description</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Describe study objectives and geographic area..."
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white focus:outline-none focus:border-[#167A4A]"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE5]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-[#E3EAE5] text-xs font-semibold text-[#66736B] hover:bg-[#F4F6F5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (mode === 'existing' && !selectedProjectId)}
            className="px-4 py-2 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Project!</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Confirm Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
