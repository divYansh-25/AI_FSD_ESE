import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/complaints/${id}`)
      .then(res => setComplaint(res.data))
      .catch(() => setError('Complaint not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const runAI = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post('/api/ai/analyze', {
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        location: complaint.location,
        complaintId: complaint._id
      });
      setComplaint(c => ({ ...c, aiAnalysis: res.data.analysis }));
    } catch (err) {
      alert('AI analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateStatus = async (newStatus) => {
    const res = await axios.put(`/api/complaints/${id}`, { status: newStatus });
    setComplaint(res.data.complaint);
  };

  const deleteComplaint = async () => {
    if (!window.confirm('Delete this complaint?')) return;
    await axios.delete(`/api/complaints/${id}`);
    navigate('/complaints');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="card"><div className="alert alert-error">{error}</div></div>;

  const ai = complaint.aiAnalysis;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <button onClick={() => navigate(-1)} className="btn btn-sm" style={{ background: '#ecf0f1', marginRight: 8 }}>← Back</button>
        {user?.role === 'admin' && (
          <button onClick={deleteComplaint} className="btn btn-sm btn-danger">Delete</button>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ marginBottom: 4 }}>{complaint.title}</h2>
          <span className={`badge badge-${complaint.status === 'In Progress' ? 'progress' : complaint.status.toLowerCase()}`}>
            {complaint.status}
          </span>
        </div>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
          Submitted by {complaint.name} ({complaint.email}) · {new Date(complaint.createdAt).toLocaleString()}
        </p>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <div><strong>Category:</strong> {complaint.category}</div>
          <div><strong>Location:</strong> {complaint.location}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong>Description:</strong>
          <p style={{ marginTop: 6, color: '#555', lineHeight: 1.6 }}>{complaint.description}</p>
        </div>

        {user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong style={{ fontSize: 13 }}>Update Status:</strong>
            {['Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => (
              <button key={s} className="btn btn-sm"
                style={{ background: complaint.status === s ? '#2c3e50' : '#ecf0f1', color: complaint.status === s ? '#fff' : '#333' }}
                onClick={() => updateStatus(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginBottom: 0 }}>🤖 AI Analysis</h2>
          <button className="btn btn-sm" style={{ background: '#8e44ad', color: '#fff' }} onClick={runAI} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : ai ? '🔄 Re-analyze' : '▶ Run Analysis'}
          </button>
        </div>

        {analyzing && <div className="loading" style={{ padding: 20 }}>AI is analyzing...</div>}

        {ai && !analyzing && (
          <div className="ai-box" style={{ marginTop: 14 }}>
            <p><strong>Urgency:</strong> <span className={`badge badge-${ai.urgency?.toLowerCase()}`}>{ai.urgency}</span></p>
            <p><strong>Department:</strong> {ai.department}</p>
            <p><strong>Summary:</strong> {ai.summary}</p>
            <p><strong>Auto Response to Citizen:</strong><br /><em style={{ color: '#555' }}>{ai.autoResponse}</em></p>
          </div>
        )}

        {!ai && !analyzing && (
          <p style={{ color: '#888', marginTop: 14, fontSize: 13 }}>Click "Run Analysis" to get AI insights about this complaint.</p>
        )}
      </div>
    </div>
  );
}
