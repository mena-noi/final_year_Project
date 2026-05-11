const express = require('express');
const router = express.Router();
const CourseMaterial = require('../models/CourseMaterial');
const { generateEmbedding } = require('../services/ragService');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Generate embeddings for all materials (admin only)
router.post('/generate-all', authMiddleware, roleMiddleware(['department_head', 'lecturer']), async (req, res) => {
  try {
    const materials = await CourseMaterial.find({ embedding: { $exists: false } });
    let count = 0;
    
    for (const material of materials) {
      const text = `${material.title} ${material.description || ''} ${material.courseCode}`;
      const embedding = await generateEmbedding(text);
      if (embedding && embedding.length > 0) {
        await CourseMaterial.updateOne({ _id: material._id }, { $set: { embedding } });
        count++;
      }
    }
    
    res.json({ message: `Generated embeddings for ${count} materials` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate embedding for a single material
router.post('/generate/:id', authMiddleware, roleMiddleware(['department_head', 'lecturer']), async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    const text = `${material.title} ${material.description || ''} ${material.courseCode}`;
    const embedding = await generateEmbedding(text);
    if (embedding && embedding.length > 0) {
      await CourseMaterial.updateOne({ _id: material._id }, { $set: { embedding } });
      res.json({ message: 'Embedding generated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to generate embedding' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;