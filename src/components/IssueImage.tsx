import { useState, useEffect } from 'react';
import { getSignedImageUrl } from '@/lib/imageUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface IssueImageProps {
  imageUrl: string;
}

export const IssueImage = ({ imageUrl }: IssueImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const url = await getSignedImageUrl(imageUrl);
      setSignedUrl(url);
      setLoading(false);
    };

    loadImage();
  }, [imageUrl]);

  if (loading) {
    return (
      <div className="lg:w-80">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Issue Photo</h3>
        <Skeleton className="w-full h-48 rounded-lg" />
      </div>
    );
  }

  if (!signedUrl) {
    return null;
  }

  return (
    <div className="lg:w-80">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Issue Photo</h3>
      <img
        src={signedUrl}
        alt="Issue photo"
        className="w-full h-48 object-cover rounded-lg border shadow-soft"
      />
    </div>
  );
};
