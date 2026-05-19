import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/complaints').then(res => {
      setComplaints(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  const recent = complaints.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, color: '#2c3e50' }}>Welcome, {user?.name} 👋</h1>
        <Link to="/new-complaint" className="btn btn-primary">+ Submit Complaint</Link>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="num">{counts.total}</div>
          <div className="label">Total</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: '#e67e22' }}>{counts.pending}</div>
          <div className="label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: '#3498db' }}>{counts.inProgress}</div>
          <div className="label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: '#27ae60' }}>{counts.resolved}</div>
          <div className="label">Resolved</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ marginBottom: 0 }}>Recent Complaints</h2>
          <Link to="/complaints" style={{ fontSize: 13, color: '#3498db' }}>View all →</Link>
        </div>
        {loading ? <div className="loading">Loading...</div> : recent.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>No complaints yet. <Link to="/new-complaint">Submit one</Link>.</p>
        ) : (
          <div className="complaint-grid">
            {recent.map(c => (
              <div key={c._id} className="complaint-card">
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.category} — {c.location}</p>
                  <p className="meta">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="actions">
                  <span className={`badge badge-${c.status === 'In Progress' ? 'progress' : c.status.toLowerCase()}`}>{c.status}</span>
                  <Link to={`/complaints/${c._id}`} className="btn btn-sm btn-primary">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
