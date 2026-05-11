// Simple face comparison service
// face-api.js will handle the heavy lifting on frontend

const compareFaces = (faceDescriptor1, faceDescriptor2, threshold = 0.6) => {
  // Convert arrays to Float32Arrays for face-api.js compatibility
  const descriptor1 = new Float32Array(faceDescriptor1);
  const descriptor2 = new Float32Array(faceDescriptor2);
  
  // Calculate Euclidean distance
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    distance += diff * diff;
  }
  distance = Math.sqrt(distance);
  
  return {
    distance: distance,
    isMatch: distance < threshold,
    confidence: 1 - (distance / threshold)
  };
};

module.exports = {
  compareFaces
};
