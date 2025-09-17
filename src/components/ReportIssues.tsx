import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Camera, 
  Upload, 
  AlertCircle, 
  Construction,
  Lightbulb,
  Trash2,
  Car,
  TreePine,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveIssue } from '@/lib/issueStorage';

const ReportIssues = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    customCategory: '',
    description: '',
    location: '',
    images: [] as File[]
  });

  const categories = [
    { id: 'potholes', label: 'Potholes & Road Issues', icon: Car },
    { id: 'streetlights', label: 'Street Lighting', icon: Lightbulb },
    { id: 'trash', label: 'Waste Management', icon: Trash2 },
    { id: 'construction', label: 'Construction Issues', icon: Construction },
    { id: 'parks', label: 'Parks & Recreation', icon: TreePine },
    { id: 'authority', label: 'Authority Issues', icon: Shield },
    { id: 'other', label: 'Other Issues', icon: AlertCircle }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.category === 'other' && !formData.customCategory) {
      toast({
        title: "Missing Information",
        description: "Please specify the custom category.",
        variant: "destructive"
      });
      return;
    }

    // Convert images to base64 for storage
    const imagePromises = formData.images.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      saveIssue({
        title: formData.title,
        category: formData.category,
        customCategory: formData.category === 'other' ? formData.customCategory : undefined,
        description: formData.description,
        location: formData.location,
        images
      });

      toast({
        title: "Report Submitted",
        description: "Your issue has been reported successfully. You'll receive updates on its progress.",
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        customCategory: '',
        description: '',
        location: '',
        images: []
      });
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: `${position.coords.latitude}, ${position.coords.longitude}`
        }));
        toast({
          title: "Location Added",
          description: "Your current location has been added to the report."
        });
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Report an Issue</h2>
        <p className="text-muted-foreground">Help improve your community by reporting issues that need attention.</p>
      </div>

      <Card className="p-6 shadow-card bg-gradient-card border-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Issue Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className="transition-smooth focus:shadow-soft"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="transition-smooth focus:shadow-soft">
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Category Input */}
          {formData.category === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="customCategory" className="text-sm font-medium">Specify Category *</Label>
              <Input
                id="customCategory"
                value={formData.customCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                placeholder="Enter specific category"
                className="transition-smooth focus:shadow-soft"
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community."
              className="min-h-[120px] transition-smooth focus:shadow-soft"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter address or coordinates"
                className="flex-1 transition-smooth focus:shadow-soft"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="px-3 hover:shadow-soft transition-smooth"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Photos (Optional)</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB (max 5 photos)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Preview uploaded images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-smooth"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:shadow-glow transition-smooth py-3 text-base font-medium"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Report
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ReportIssues;