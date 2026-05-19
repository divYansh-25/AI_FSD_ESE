import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Water Supply', 'Electricity', 'Roads', 'Sanitation', 'Garbage', 'Public Safety', 'Healthcare', 'Education', 'Other'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

export default function ComplaintList() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await axios.get(`/api/complaints/search?location=${search}`);
      } else {
        const params = {};
        if (category !== 'All') params.category = category;
        if (status !== 'All') params.status = status;
        res = await axios.get('/api/complaints', { params });
      }
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [category, status, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    await axios.delete(`/api/complaints/${id}`);
    setComplaints(c => c.filter(x => x._id !== id));
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await axios.put(`/api/complaints/${id}`, { status: newStatus });
    setComplaints(c => c.map(x => x._id === id ? res.data.complaint : x));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, color: '#2c3e50' }}>All Complaints</h1>
        <Link to="/new-complaint" className="btn btn-primary btn-sm">+ New</Link>
      </div>

      <div className="filters">
        <select value={category} onChange={e => { setCategory(e.target.value); setSearch(''); }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input
          placeholder="Search by location..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
          style={{ minWidth: 200 }}
        />
        <button className="btn btn-primary btn-sm" onClick={() => setSearch(searchInput)}>Search</button>
        {search && <button className="btn btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }} style={{ background: '#ecf0f1' }}>Clear</button>}
      </div>

      {loading ? <div className="loading">Loading...</div> : complaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>No complaints found.</div>
      ) : (
        <div className="complaint-grid">
          {complaints.map(c => (
            <div key={c._id} className={`complaint-card ${c.aiAnalysis?.urgency || ''}`}>
              <div style={{ flex: 1 }}>
                <h3>{c.title}</h3>
                <p>{c.name} · {c.email}</p>
                <p style={{ marginTop: 4 }}><b>{c.category}</b> — {c.location}</p>
                {c.aiAnalysis?.urgency && (
                  <span className={`badge badge-${c.aiAnalysis.urgency.toLowerCase()}`} style={{ marginTop: 6 }}>
                    {c.aiAnalysis.urgency} Priority
                  </span>
                )}
                <p className="meta">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className={`badge badge-${c.status === 'In Progress' ? 'progress' : c.status.toLowerCase()}`}>{c.status}</span>
                {user?.role === 'admin' && (
                  <select value={c.status} onChange={e => handleStatusChange(c._id, e.target.value)}
                    style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #ddd', borderRadius: 4 }}>
                    {['Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                )}
                <Link to={`/complaints/${c._id}`} className="btn btn-sm btn-primary">View</Link>
                {user?.role === 'admin' && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
