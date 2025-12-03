import { useState, useEffect, useCallback } from 'react';
import { SkeletonPhotoGrid } from '../components/Skeleton';
import Lightbox from '../components/Lightbox';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [captions, setCaptions] = useState({});

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/gallery`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setPendingFiles(fileArray);
    // Initialize empty captions for each file
    const initialCaptions = {};
    fileArray.forEach((file, index) => {
      initialCaptions[index] = '';
    });
    setCaptions(initialCaptions);
  };

  const handleCaptionChange = (index, value) => {
    // Limit to 25 characters
    if (value.length <= 25) {
      setCaptions(prev => ({ ...prev, [index]: value }));
    }
  };

  const cancelUpload = () => {
    setPendingFiles([]);
    setCaptions({});
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    pendingFiles.forEach((file, index) => {
      formData.append('photos', file);
    });
    // Send captions as JSON string
    formData.append('captions', JSON.stringify(Object.values(captions)));

    try {
      const response = await fetch(`${API_URL}/api/gallery/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `${result.uploaded} photo(s) uploaded!` });
        setPendingFiles([]);
        setCaptions({});
        fetchPhotos();
      } else {
        setMessage({ type: 'error', text: result.message || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

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
      handleFilesSelected(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e) => {
    handleFilesSelected(e.target.files);
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
        {pendingFiles.length === 0 ? (
          <div
            className={`upload-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="photo-upload"
              disabled={uploading}
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
        ) : (
          /* Caption Entry Form */
          <div className="modern-card p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Add Captions (optional)
            </h3>
            <div className="space-y-4 mb-6">
              {pendingFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={captions[index] || ''}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      maxLength={25}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <span className="text-xs text-neutral-400 mt-1 block">
                      {(captions[index] || '').length}/25
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelUpload}
                className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400 text-white font-medium rounded-xl transition-all"
              >
                {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} Photo${pendingFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

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
                >
                  <img
                    src={`${API_URL}${photo.url}`}
                    alt={photo.caption || 'Gallery photo'}
                    className="photo-grid-image"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs truncate">{photo.caption}</p>
                    </div>
                  )}
                  <div className="photo-grid-overlay">
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
