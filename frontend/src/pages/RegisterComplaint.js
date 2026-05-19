import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Water Supply', 'Electricity', 'Roads', 'Sanitation', 'Garbage', 'Public Safety', 'Healthcare', 'Education', 'Other'];

export default function RegisterComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', title: '', description: '', category: '', location: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  if (user?.role === 'admin') {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p style={{ color: '#888', marginTop: 8 }}>Admins cannot submit complaints.</p>
      </div>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      const res = await axios.post('/api/complaints', form);
      setSuccess('Complaint submitted successfully!');
      runAI(res.data.complaint._id);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Submission failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const runAI = async (complaintId) => {
    setAnalyzing(true);
    try {
      const res = await axios.post('/api/ai/analyze', {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        complaintId
      });
      setAiResult(res.data.analysis);
    } catch (err) {
      console.error('AI analysis failed:', err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const urgencyClass = aiResult ? aiResult.urgency?.toLowerCase() : '';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="card">
        <h2>📝 Register New Complaint</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Rahul Kumar" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="rahul@gmail.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Complaint Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Water Leakage Issue" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} required placeholder="Ghaziabad" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Describe the issue in detail..." rows={4} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button type="button" className="btn" style={{ background: '#8e44ad', color: '#fff' }} onClick={() => runAI(null)} disabled={analyzing || !form.title || !form.description}>
              {analyzing ? 'Analyzing...' : '🤖 AI Preview'}
            </button>
          </div>
        </form>
      </div>

      {analyzing && <div className="loading">🤖 AI is analyzing your complaint...</div>}

      {aiResult && (
        <div className="ai-box">
          <h3>🤖 AI Analysis Result</h3>
          <p><strong>Urgency:</strong> <span className={`badge badge-${urgencyClass}`}>{aiResult.urgency}</span></p>
          <p><strong>Responsible Department:</strong> {aiResult.department}</p>
          <p><strong>Summary:</strong> {aiResult.summary}</p>
          <p><strong>Auto Response:</strong> <em>{aiResult.autoResponse}</em></p>
          {success && (
            <button className="btn btn-success btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/complaints')}>
              View All Complaints →
            </button>
          )}
        </div>
      )}
    </div>
  );
}