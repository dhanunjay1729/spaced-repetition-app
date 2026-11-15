// utils/imageUtils.js
// Utility functions for handling and compressing card images

/**
 * Compresses an image file (e.g. from file input or paste) using HTML canvas.
 * Resizes to max dimensions and converts to JPEG or PNG data URL.
 * 
 * @param {File|Blob} file 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @param {number} quality (0 to 1)
 * @returns {Promise<string>} Base64 data URL
 */
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional aspect ratio resize
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(event.target.result); // Fallback to raw data URL
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if PNG, otherwise use JPEG for optimal size
        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
};
