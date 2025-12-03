import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from '../components/Confetti';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
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
  const [showConfetti, setShowConfetti] = useState(false);

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

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Welcome to the family! Redirecting...' });
        setShowConfetti(true);
        setTimeout(() => {
          navigate('/family-tree');
        }, 2500);
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

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Join the Madrigal Family Reunion on December 13, 2025! Register here: ${window.location.origin}/register`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      {/* Confetti celebration */}
      <Confetti active={showConfetti} duration={2500} />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Register</h1>
            <p className="text-neutral-600">Join the Madrigal family reunion</p>
          </div>
          <button
            type="button"
            onClick={shareToWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all btn-press text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
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
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-400">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <label className="cursor-pointer">
                <span className="inline-block px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-all btn-press">
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

          {/* City */}
          <FloatingLabelInput
            label="City"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleInputChange}
            required
            helper="Where are you traveling from?"
          />

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
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400 text-white font-medium py-4 rounded-xl transition-all mt-6 btn-press"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : 'Register'}
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
