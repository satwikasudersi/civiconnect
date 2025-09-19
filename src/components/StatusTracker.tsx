import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Calendar,
  MapPin,
  MessageCircle,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Trash
} from 'lucide-react';
import { getIssues, Issue, deleteIssue } from '@/lib/issueStorage';
import { useToast } from '@/hooks/use-toast';

const StatusTracker = ({ onViewSuggestions }: { onViewSuggestions: (issue: Issue) => void }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    setIssues(getIssues());
  }, []);

  const getCategoryLabel = (issue: Issue) => {
    if (issue.customCategory) return issue.customCategory;
    
    const categoryLabels: Record<string, string> = {
      potholes: 'Potholes & Road Issues',
      streetlights: 'Street Lighting',
      water: 'Water Issue',
      trash: 'Waste Management',
      construction: 'Construction Issues',
      parks: 'Parks & Recreation',
      authority: 'Authority Issues',
      corpse: 'Corpse on Streets',
      other: 'Other Issues'
    };
    
    return categoryLabels[issue.category] || issue.category;
  };

  const handleDeleteIssue = (issueId: string) => {
    const success = deleteIssue(issueId);
    if (success) {
      setIssues(getIssues());
      toast({
        title: "Issue Deleted",
        description: "The issue has been successfully deleted."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the issue. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusInfo = (status: Issue['status']) => {
    switch (status) {
      case 'reported':
        return {
          label: 'Reported',
          color: 'bg-status-reported text-white',
          icon: AlertTriangle
        };
      case 'progress':
        return {
          label: 'In Progress',
          color: 'bg-status-progress text-white',
          icon: Clock
        };
      case 'resolved':
        return {
          label: 'Resolved',
          color: 'bg-status-resolved text-white',
          icon: CheckCircle
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-muted text-muted-foreground',
          icon: AlertTriangle
        };
    }
  };

  const filteredIssues = issues.filter(issue => {
    const categoryLabel = getCategoryLabel(issue);
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    reported: issues.filter(i => i.status === 'reported').length,
    progress: issues.filter(i => i.status === 'progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Issue Status Tracker</h2>
        <p className="text-muted-foreground">Track the progress of reported community issues.</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 shadow-soft border-status-reported/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reported</p>
              <p className="text-2xl font-bold text-status-reported">{statusCounts.reported}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-status-reported" />
          </div>
        </Card>
        
        <Card className="p-4 shadow-soft border-status-progress/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-status-progress">{statusCounts.progress}</p>
            </div>
            <Clock className="w-8 h-8 text-status-progress" />
          </div>
        </Card>
        
        <Card className="p-4 shadow-soft border-status-resolved/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-status-resolved">{statusCounts.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-status-resolved" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search issues by title, location, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'reported', 'progress', 'resolved'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className="capitalize transition-smooth"
              >
                {status === 'all' ? 'All Issues' : status.replace('progress', 'In Progress')}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const statusInfo = getStatusInfo(issue.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={issue.id} className="p-6 shadow-card hover:shadow-glow transition-smooth">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{issue.title}</h3>
                    <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(issue)}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{issue.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {issue.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(issue.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {issue.images.length} photo{issue.images.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" />
                      {issue.enquiries} enquir{issue.enquiries !== 1 ? 'ies' : 'y'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onViewSuggestions(issue)}
                    className="flex items-center gap-2 hover:shadow-soft transition-smooth"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {issue.suggestions} Suggestions
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:shadow-soft transition-smooth"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {issue.enquiries} Enquiries
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="flex items-center gap-2 hover:shadow-soft transition-smooth"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredIssues.length === 0 && (
        <Card className="p-8 text-center shadow-soft">
          <p className="text-muted-foreground">No issues found matching your criteria.</p>
        </Card>
      )}
    </div>
  );
};

export default StatusTracker;