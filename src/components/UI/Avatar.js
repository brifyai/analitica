import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  fallbackText,
  showFallback = true,
  onLoad,
  onError,
  ...props 
}) => {
  const [imageStatus, setImageStatus] = useState('loading'); // loading, loaded, error
  const [imageSrc, setImageSrc] = useState(src);
  const imgRef = useRef(null);

  // Size configurations
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
    '3xl': 'h-24 w-24 text-3xl'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Update image source when src prop changes
  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src);
      setImageStatus('loading');
    }
  }, [src, imageSrc]);

  const handleImageLoad = () => {
    setImageStatus('loaded');
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    console.warn('Error cargando imagen de avatar:', src);
    setImageStatus('error');
    if (onError) onError();
  };

  // Generate fallback text
  const getFallbackText = () => {
    if (fallbackText) return fallbackText;
    if (alt && alt.length > 0) return alt.charAt(0).toUpperCase();
    return '?';
  };

  // If no source provided, show fallback immediately
  if (!src && showFallback) {
    return (
      <div 
        className={`
          ${currentSizeClass} 
          rounded-full 
          bg-gradient-to-br from-blue-500 to-purple-600 
          flex items-center justify-center 
          text-white font-medium 
          shadow-lg
          ${className}
        `}
        {...props}
      >
        <span className="select-none">{getFallbackText()}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${currentSizeClass} ${className}`} {...props}>
      {/* Image */}
      {imageStatus !== 'error' && src && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt || 'Avatar'}
          className={`
            ${currentSizeClass}
            rounded-full 
            object-cover 
            shadow-lg
            transition-opacity duration-300
            ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
        />
      )}

      {/* Loading state */}
      {imageStatus === 'loading' && (
        <div className={`
          absolute inset-0 
          ${currentSizeClass}
          rounded-full 
          bg-gray-200 
          animate-pulse
        `} />
      )}

      {/* Fallback */}
      {(imageStatus === 'error' || !src) && showFallback && (
        <div 
          className={`
            absolute inset-0 
            ${currentSizeClass}
            rounded-full 
            bg-gradient-to-br from-blue-500 to-purple-600 
            flex items-center justify-center 
            text-white font-medium 
            shadow-lg
          `}
        >
          <span className="select-none">{getFallbackText()}</span>
        </div>
      )}

      {/* Optional icon fallback */}
      {(imageStatus === 'error' || !src) && !showFallback && (
        <div 
          className={`
            absolute inset-0 
            ${currentSizeClass}
            rounded-full 
            bg-gray-300 
            flex items-center justify-center 
            text-gray-600
          `}
        >
          <User className="h-1/2 w-1/2" />
        </div>
      )}
    </div>
  );
};

export default Avatar;