import React, { useState } from 'react';

interface RequestAccessFormProps {
  userEmail?: string;
}

export const RequestAccessForm: React.FC<RequestAccessFormProps> = ({ userEmail }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: userEmail || '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const getToken = (window as any).__auth0_getToken;
      if (!getToken) throw new Error('Auth token not available');
      const token = await getToken();
      
      const requestBody = {
        name: formData.name,
        email: formData.email,
        description: formData.description
      };
      
      console.log('Sending request:', requestBody);
      
      const response = await fetch(`${import.meta.env.VITE_PRESIGN_API_BASE}/presign?op=request_access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to submit request');
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="request-access-card">
        <h3>Request Submitted</h3>
        <p>Your access request has been sent to our team. We'll review your request and get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="request-access-card">
      <h3>Request Dataset Access</h3>
      <p>To access research datasets, please fill out the form below and we'll review your request.</p>
      
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Intended Use *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe how you plan to use the datasets and any relevant research background..."
            rows={4}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !formData.name || !formData.email || !formData.description}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};