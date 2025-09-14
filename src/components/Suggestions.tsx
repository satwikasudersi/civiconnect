import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Send,
  Camera,
  User,
  Calendar,
  MapPin,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  images?: string[];
}

const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    content: 'I suggest using a more durable asphalt mix for this area since it gets heavy truck traffic. The city should also consider installing proper drainage to prevent water pooling.',
    date: '2024-01-16',
    likes: 12
  },
  {
    id: '2',
    author: 'Mike Rodriguez',
    content: 'Temporary solution: Place warning cones around the pothole until repairs can be made. I can volunteer to help coordinate with local businesses for temporary signage.',
    date: '2024-01-15',
    likes: 8
  },
  {
    id: '3',
    author: 'Community Manager',
    content: 'Thank you for the suggestions! We have scheduled this for repair next week. The road crew will use the enhanced asphalt mix as recommended.',
    date: '2024-01-17',
    likes: 15
  }
];

interface Issue {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  status: 'reported' | 'progress' | 'resolved';
  description: string;
  images: string[];
  suggestions: number;
  enquiries: number;
}

const Suggestions = ({ issue, onBack }: { issue: Issue; onBack: () => void }) => {
  const { toast } = useToast();
  const [newSuggestion, setNewSuggestion] = useState('');
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [likedSuggestions, setLikedSuggestions] = useState<Set<string>>(new Set());

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSuggestion.trim()) {
      toast({
        title: "Empty Suggestion",
        description: "Please write a suggestion before submitting.",
        variant: "destructive"
      });
      return;
    }

    const suggestion: Suggestion = {
      id: Date.now().toString(),
      author: 'You',
      content: newSuggestion.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setSuggestions(prev => [suggestion, ...prev]);
    setNewSuggestion('');
    
    toast({
      title: "Suggestion Added",
      description: "Your suggestion has been added to this issue."
    });
  };

  const handleLike = (suggestionId: string) => {
    const isLiked = likedSuggestions.has(suggestionId);
    
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, likes: suggestion.likes + (isLiked ? -1 : 1) }
          : suggestion
      )
    );

    setLikedSuggestions(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <Badge className="bg-status-reported text-white">Reported</Badge>;
      case 'progress':
        return <Badge className="bg-status-progress text-white">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-status-resolved text-white">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Status Tracker
        </Button>
      </div>

      {/* Issue Details */}
      <Card className="p-6 mb-6 shadow-card bg-gradient-card">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
              {getStatusBadge(issue.status)}
            </div>
            <p className="text-muted-foreground mb-4">{issue.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {issue.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Reported {new Date(issue.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {suggestions.length} Suggestions
              </div>
            </div>
          </div>
          
          {/* Issue Images */}
          {issue.images.length > 0 && (
            <div className="lg:w-80">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Issue Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {issue.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Issue photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border shadow-soft"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Add New Suggestion */}
      <Card className="p-6 mb-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Add Your Suggestion</h3>
        </div>
        
        <form onSubmit={handleSubmitSuggestion} className="space-y-4">
          <div>
            <Label htmlFor="suggestion" className="sr-only">Your suggestion</Label>
            <Textarea
              id="suggestion"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="Share your ideas on how to resolve this issue or improve the solution..."
              className="min-h-[100px] resize-none transition-smooth focus:shadow-soft"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Add Photos
            </Button>
            
            <Button
              type="submit"
              className="flex items-center gap-2 bg-gradient-primary hover:shadow-soft transition-smooth"
            >
              <Send className="w-4 h-4" />
              Submit Suggestion
            </Button>
          </div>
        </form>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Community Suggestions ({suggestions.length})
        </h3>
        
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="p-6 shadow-soft hover:shadow-card transition-smooth">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 bg-gradient-primary">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {suggestion.author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{suggestion.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(suggestion.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-foreground mb-4 leading-relaxed">{suggestion.content}</p>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(suggestion.id)}
                    className={`flex items-center gap-2 transition-smooth ${
                      likedSuggestions.has(suggestion.id) 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {suggestion.likes}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card className="p-8 text-center shadow-soft">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No suggestions yet. Be the first to share your ideas!</p>
        </Card>
      )}
    </div>
  );
};

export default Suggestions;