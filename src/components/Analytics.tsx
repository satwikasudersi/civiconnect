import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  Users, 
  BarChart3,
  Calendar,
  Award,
  AlertTriangle
} from 'lucide-react';

const Analytics = () => {
  const totalIssues = 145;
  const resolvedIssues = 89;
  const inProgressIssues = 32;
  const reportedIssues = 24;
  
  const resolutionRate = Math.round((resolvedIssues / totalIssues) * 100);
  const avgResolutionTime = '5.2 days';

  const categoryData = [
    { name: 'Road Issues', count: 45, percentage: 31 },
    { name: 'Street Lighting', count: 28, percentage: 19 },
    { name: 'Waste Management', count: 35, percentage: 24 },
    { name: 'Parks & Recreation', count: 22, percentage: 15 },
    { name: 'Construction Issues', count: 15, percentage: 11 }
  ];

  const recentActivity = [
    { action: 'Issue Resolved', item: 'Broken streetlight on Oak Ave', time: '2 hours ago', type: 'resolved' },
    { action: 'New Report', item: 'Pothole on Main Street', time: '4 hours ago', type: 'reported' },
    { action: 'Status Updated', item: 'Park maintenance request', time: '6 hours ago', type: 'progress' },
    { action: 'Issue Resolved', item: 'Trash collection delay', time: '1 day ago', type: 'resolved' },
    { action: 'New Suggestion', item: 'Traffic signal timing improvement', time: '1 day ago', type: 'suggestion' }
  ];

  const topLocations = [
    { location: 'Downtown District', issues: 23 },
    { location: 'Residential Area North', issues: 18 },
    { location: 'Industrial Zone', issues: 15 },
    { location: 'Park District', issues: 12 },
    { location: 'Commercial Area', issues: 9 }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resolved':
        return <div className="w-2 h-2 bg-status-resolved rounded-full" />;
      case 'progress':
        return <div className="w-2 h-2 bg-status-progress rounded-full" />;
      case 'reported':
        return <div className="w-2 h-2 bg-status-reported rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-primary rounded-full" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Monitor community engagement and issue resolution metrics.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Issues</p>
              <p className="text-2xl font-bold text-foreground">{totalIssues}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
              <p className="text-2xl font-bold text-foreground">{resolutionRate}%</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +5% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-status-resolved/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-status-resolved" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-foreground">{avgResolutionTime}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                -2.1 days
              </p>
            </div>
            <div className="w-12 h-12 bg-status-progress/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-status-progress" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Citizens</p>
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +156 this month
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Issue Categories */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Issues by Category
          </h3>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Locations */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Most Reported Locations
          </h3>
          <div className="space-y-3">
            {topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">{location.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{location.issues}</span>
                  <span className="text-xs text-muted-foreground">issues</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-muted/30 rounded-lg transition-smooth">
              <div className="flex items-center justify-center w-8 h-8">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.item}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;