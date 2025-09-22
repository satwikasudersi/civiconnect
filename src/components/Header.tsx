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
    <header className="bg-gradient-primary text-primary-foreground shadow-glow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CivicConnect</h1>
              <p className="text-sm opacity-90">Community Issue Reporting</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 transition-smooth ${
                      activeTab === item.id 
                        ? 'bg-primary-foreground/20 text-primary-foreground shadow-soft' 
                        : 'hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
            
            {/* User Info and Sign Out */}
            <div className="flex items-center space-x-3 border-l border-primary-foreground/20 pl-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-primary-foreground/10 flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
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