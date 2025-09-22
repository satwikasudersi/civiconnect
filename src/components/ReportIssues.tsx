import { useState, useEffect } from 'react';
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
  Shield,
  Droplets,
  AlertTriangle,
  Mic,
  MicOff,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveIssue } from '@/lib/supabaseOperations';
import { useAuth } from '@/contexts/AuthContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const ReportIssues = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    location: '',
    images: [] as File[]
  });

  const [activeField, setActiveField] = useState<'title' | 'description' | 'location' | null>(null);
  const { 
    isSupported: speechSupported, 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();

  // Handle speech recognition transcript updates
  useEffect(() => {
    if (transcript && activeField) {
      setFormData(prev => ({
        ...prev,
        [activeField]: transcript
      }));
    }
  }, [transcript, activeField]);

  const categories = [
    { id: 'municipal', label: 'Municipal Corporation', icon: Shield },
    { id: 'corruption', label: 'Political Corruption', icon: AlertTriangle }
  ];

  const subcategories = {
    municipal: [
      { id: 'potholes', label: 'Potholes & Road Issues', icon: Car },
      { id: 'streetlights', label: 'Street Lighting', icon: Lightbulb },
      { id: 'water', label: 'Water Issue', icon: Droplets },
      { id: 'trash', label: 'Waste Management', icon: Trash2 },
      { id: 'construction', label: 'Construction Issues', icon: Construction },
      { id: 'parks', label: 'Parks & Recreation', icon: TreePine },
      { id: 'corpse', label: 'Corpse on Streets', icon: AlertCircle }
    ],
    corruption: []
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report an issue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.category === 'municipal' && !formData.subcategory) {
      toast({
        title: "Missing Information",
        description: "Please select a subcategory for Municipal Corporation issues.",
        variant: "destructive"
      });
      return;
    }

    try {
      const categoryValue = formData.category === 'municipal' && formData.subcategory 
        ? formData.subcategory 
        : formData.category;
      
      const result = await saveIssue({
        title: formData.title,
        category: categoryValue,
        description: formData.description,
        location: formData.location,
        images: formData.images
      });

      if (result) {
        // Reset form
        setFormData({
          title: '',
          category: '',
          subcategory: '',
          description: '',
          location: '',
          images: []
        });
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast({
        title: "Error",
        description: "Failed to submit issue. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startSpeechRecognition = (field: 'title' | 'description' | 'location') => {
    if (!speechSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    setActiveField(field);
    resetTranscript();
    startListening();
    
    toast({
      title: "Listening...",
      description: `Speak your ${field}. Click stop when finished.`
    });
  };

  const stopSpeechRecognition = () => {
    stopListening();
    setActiveField(null);
    
    toast({
      title: "Recording Stopped",
      description: "Your speech has been converted to text."
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
        <p className="text-muted-foreground">
          Civic Crowdsourced Reporting System for Telangana - Report municipal issues or political corruption cases. 
          Municipal issues will be forwarded to Greater Hyderabad Municipal Corporation (155304), 
          corruption cases to Anti Corruption Bureau Telangana (040-2325-1555).
        </p>
      </div>

      <Card className="p-6 shadow-card bg-gradient-card border-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Issue Title *</Label>
            <div className="flex space-x-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                className="flex-1 transition-smooth focus:shadow-soft"
                required
              />
              {speechSupported && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isListening && activeField === 'title') {
                      stopSpeechRecognition();
                    } else {
                      startSpeechRecognition('title');
                    }
                  }}
                  className={`px-3 hover:shadow-soft transition-smooth ${
                    isListening && activeField === 'title' ? 'bg-red-500 text-white hover:bg-red-600' : ''
                  }`}
                >
                  {isListening && activeField === 'title' ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            {isListening && activeField === 'title' && (
              <p className="text-xs text-blue-600 animate-pulse">🎤 Listening... Click stop when finished</p>
            )}
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

          {/* Subcategory Selection */}
          {formData.category === 'municipal' && (
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-medium">Municipal Issue Type *</Label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}>
                <SelectTrigger className="transition-smooth focus:shadow-soft">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.municipal.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <SelectItem key={sub.id} value={sub.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{sub.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              {speechSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isListening && activeField === 'description') {
                      stopSpeechRecognition();
                    } else {
                      startSpeechRecognition('description');
                    }
                  }}
                  className={`px-3 hover:shadow-soft transition-smooth ${
                    isListening && activeField === 'description' ? 'bg-red-500 text-white hover:bg-red-600' : ''
                  }`}
                >
                  {isListening && activeField === 'description' ? (
                    <>
                      <Square className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-1" />
                      Voice
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community."
              className="min-h-[120px] transition-smooth focus:shadow-soft"
              required
            />
            {isListening && activeField === 'description' && (
              <p className="text-xs text-blue-600 animate-pulse">🎤 Listening... Speak your description. Click stop when finished</p>
            )}
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
              {speechSupported && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isListening && activeField === 'location') {
                      stopSpeechRecognition();
                    } else {
                      startSpeechRecognition('location');
                    }
                  }}
                  className={`px-3 hover:shadow-soft transition-smooth ${
                    isListening && activeField === 'location' ? 'bg-red-500 text-white hover:bg-red-600' : ''
                  }`}
                >
                  {isListening && activeField === 'location' ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            {isListening && activeField === 'location' && (
              <p className="text-xs text-blue-600 animate-pulse">🎤 Listening... Speak the location. Click stop when finished</p>
            )}
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