import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationshipType: '',
    connectedThrough: '',
    generation: '',
    familyBranch: '',
    attendees: '1'
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
        setTimeout(() => {
          navigate('/family-tree');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Register</h1>
          <p className="text-neutral-600">Join the Madrigal family reunion</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modern-card p-6 md:p-8">
          {/* Photo Upload - First */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-6">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <label className="cursor-pointer">
                <span className="inline-block px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors">
                  Choose Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <FloatingLabelInput
            label="Full Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          {/* Email & Phone */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <FloatingLabelInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <FloatingLabelInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Relationship Type */}
          <FloatingLabelSelect
            label="Relationship Type"
            name="relationshipType"
            value={formData.relationshipType}
            onChange={handleInputChange}
            required
            options={[
              { value: '', label: '' },
              { value: 'Immediate Family', label: 'Immediate Family' },
              { value: 'Spouse', label: 'Spouse' },
              { value: 'Child', label: 'Child' },
              { value: 'Grandchild', label: 'Grandchild' },
              { value: 'Sibling', label: 'Sibling' },
              { value: 'Cousin', label: 'Cousin' },
              { value: 'Aunt/Uncle', label: 'Aunt/Uncle' },
              { value: 'Niece/Nephew', label: 'Niece/Nephew' },
              { value: 'In-law', label: 'In-law' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          {/* Connected Through */}
          <FloatingLabelInput
            label="Connected Through"
            name="connectedThrough"
            type="text"
            value={formData.connectedThrough}
            onChange={handleInputChange}
            required
            helper="e.g., Abuela Alma, Julieta Madrigal"
          />

          {/* Generation & Attendees */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <FloatingLabelSelect
              label="Generation"
              name="generation"
              value={formData.generation}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: '' },
                { value: '1', label: '1st Generation' },
                { value: '2', label: '2nd Generation' },
                { value: '3', label: '3rd Generation' },
                { value: '4', label: '4th Generation' },
                { value: '5', label: '5th Generation' }
              ]}
            />
            <FloatingLabelInput
              label="Number of Attendees"
              name="attendees"
              type="number"
              min="1"
              value={formData.attendees}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Family Branch */}
          <FloatingLabelTextarea
            label="Family Branch Description"
            name="familyBranch"
            value={formData.familyBranch}
            onChange={handleInputChange}
            required
            rows={3}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400 text-white font-medium py-4 rounded-xl transition-colors mt-6"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FloatingLabelInput({ label, helper, ...props }) {
  return (
    <div className="floating-label-group">
      <input
        {...props}
        placeholder=" "
        className="floating-label-input"
      />
      <label className="floating-label">{label}</label>
      {helper && <p className="text-xs text-neutral-500 mt-1 ml-1">{helper}</p>}
    </div>
  );
}

function FloatingLabelSelect({ label, options, ...props }) {
  return (
    <div className="floating-label-group">
      <select
        {...props}
        className="floating-label-input"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <label className="floating-label">{label}</label>
    </div>
  );
}

function FloatingLabelTextarea({ label, ...props }) {
  return (
    <div className="floating-label-group">
      <textarea
        {...props}
        placeholder=" "
        className="floating-label-input resize-none"
      />
      <label className="floating-label">{label}</label>
    </div>
  );
}

export default Register;
