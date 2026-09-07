const supabase = require('../config/supabase');

const BUCKET = process.env.SUPABASE_BUCKET;

// Uploads a file buffer (from multer memory storage) to Supabase Storage
// Returns the storage path (not a public URL, since the bucket is private)
const uploadFile = async (file, folder = 'lab-reports') => {
  const path = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
  });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  return path;
};

// Generates a temporary signed URL so the file can be viewed/downloaded
// without making the whole bucket public. Expires after `expiresIn` seconds.
const getSignedUrl = async (path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw new Error(`Supabase signed URL failed: ${error.message}`);
  return data.signedUrl;
};

const deleteFile = async (path) => {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
};

module.exports = { uploadFile, getSignedUrl, deleteFile };