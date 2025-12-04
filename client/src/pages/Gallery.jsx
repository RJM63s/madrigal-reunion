import { useState, useEffect, useCallback } from 'react';
import { SkeletonPhotoGrid } from '../components/Skeleton';
import Lightbox from '../components/Lightbox';

// Use environment variable, or empty string for same-origin requests in production
const API_URL = import.meta.env.VITE_API_URL || '';

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/gallery`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setMessage({ type: 'error', text: 'Unable to load photos. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/gallery/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `${result.uploaded} photo(s) uploaded!` });
        fetchPhotos();
      } else {
        setMessage({ type: 'error', text: result.message || 'Upload failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setUploading(false);
    }
  }, [fetchPhotos]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const handleFileInput = (e) => {
    handleUpload(e.target.files);
  };

  const openLightbox = (index) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToNext = () => {
    setSelectedIndex(prev => Math.min(prev + 1, photos.length - 1));
  };

  const goToPrev = () => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  };

  const lightboxImages = photos.map(photo => ({
    url: `${API_URL}${photo.url}`,
    caption: photo.caption,
    uploadedBy: photo.uploadedBy
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Photo Gallery</h1>
          <p className="text-neutral-600">Share your favorite memories</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`upload-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          role="button"
          aria-label="Photo upload area"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
            aria-label="Choose photos to upload"
          />
          <label htmlFor="photo-upload" className="upload-zone-content">
            {uploading ? (
              <>
                <div className="upload-spinner" />
                <span className="text-neutral-600">Uploading...</span>
              </>
            ) : (
              <>
                <div className="upload-icon">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-neutral-900 font-medium">
                  {dragActive ? 'Drop photos here' : 'Tap to upload photos'}
                </span>
                <span className="text-sm text-neutral-500">or drag and drop</span>
              </>
            )}
          </label>
        </div>

        {/* Photo Grid */}
        <div className="mt-8">
          {loading ? (
            <SkeletonPhotoGrid count={6} />
          ) : photos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No photos yet</h3>
              <p className="text-neutral-600">Be the first to share a memory!</p>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="photo-grid-item group"
                  aria-label={`View photo${photo.caption ? ': ' + photo.caption : ' ' + (index + 1)}`}
                >
                  <img
                    src={`${API_URL}${photo.url}`}
                    alt={photo.caption || 'Gallery photo'}
                    className="photo-grid-image"
                    loading="lazy"
                  />
                  <div className="photo-grid-overlay" aria-hidden="true">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={selectedIndex}
          onClose={closeLightbox}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      )}
    </div>
  );
}

export default Gallery;
