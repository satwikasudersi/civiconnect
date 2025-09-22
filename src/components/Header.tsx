import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  LogOut,
  User,
  Shield
} from 'lucide-react';

const Header = ({ activeTab, setActiveTab }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  const navItems = [
    { id: 'reports', label: 'Report Issues', icon: FileText },
    { id: 'status', label: 'Status Tracker', icon: BarChart3 },
    { id: 'myreports', label: 'My Reports', icon: User },
    { id: 'blockchain', label: 'Blockchain', icon: Shield },
    { id: 'suggestions', label: 'Suggestions', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: Settings }
  ];

  return (
    <header className="glass bg-gradient-primary/10 backdrop-blur-md text-foreground shadow-glass sticky top-0 z-50 border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow transform transition-transform group-hover:scale-110 animate-glow">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">CivicConnect</h1>
              <p className="text-sm text-muted-foreground">Smart Community Reporting</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium
                      transition-all duration-300 ease-smooth relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-primary text-white shadow-glow' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'animate-glow' : ''}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-primary opacity-20 animate-shimmer" />
                    )}
                  </Button>
                );
              })}
            </nav>
            
            {/* User Info and Sign Out */}
            <div className="flex items-center space-x-4 border-l border-border/50 pl-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft animate-float">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-foreground">{user?.email?.slice(0, 20)}</p>
                  <p className="text-xs text-muted-foreground">Active User</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="btn-modern text-white border-primary/30 hover:border-primary hover:shadow-glow"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-primary-foreground/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 justify-start px-4 py-2 transition-smooth ${
                      activeTab === item.id 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
              
              {/* Mobile User Info and Sign Out */}
              <div className="border-t border-primary-foreground/20 pt-2 mt-2">
                <div className="flex items-center space-x-2 px-4 py-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start px-4 py-2 hover:bg-primary-foreground/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;