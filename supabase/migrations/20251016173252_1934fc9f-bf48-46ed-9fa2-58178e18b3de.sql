-- Make the issue-images storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'issue-images';