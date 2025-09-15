import { useState } from 'react';
import Header from '@/components/Header';
import ReportIssues from '@/components/ReportIssues';
import StatusTracker from '@/components/StatusTracker';
import Suggestions from '@/components/Suggestions';
import Analytics from '@/components/Analytics';
import civicHero from '@/assets/civic-hero.jpg';
const Index = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const handleViewSuggestions = (issue: any) => {
    setSelectedIssue(issue);
    setActiveTab('suggestions');
  };
  const handleBackToStatus = () => {
    setSelectedIssue(null);
    setActiveTab('status');
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return <ReportIssues />;
      case 'suggestions':
        return selectedIssue ? <Suggestions issue={selectedIssue} onBack={handleBackToStatus} /> : <div className="max-w-4xl mx-auto p-6 text-center">
            <p className="text-muted-foreground">Select an issue from the Status Tracker to view suggestions.</p>
          </div>;
      case 'status':
        return <StatusTracker onViewSuggestions={handleViewSuggestions} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <ReportIssues />;
    }
  };
  return <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Hero Section - Only show on reports tab */}
      {activeTab === 'reports' && <section className="relative overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 opacity-20">
            <img src={civicHero} alt="Civic community illustration" className="w-full h-full object-cover" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Build Better Together
              </h1>
              <p className="text-xl mb-8 max-w-3xl mx-[106px] text-slate-50 md:text-2xl font-medium text-center">Your Streets. Your Voice. Your Power.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => document.getElementById('report-form')?.scrollIntoView({
              behavior: 'smooth'
            })} className="bg-primary-foreground text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-glow transition-smooth">
                  Report an Issue
                </button>
                <button onClick={() => setActiveTab('status')} className="bg-primary-foreground/10 text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-smooth">
                  View Status Updates
                </button>
              </div>
            </div>
          </div>
        </section>}

      {/* Main Content */}
      <main id="report-form">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-muted/30 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            Built for hackathon - Empowering communities through civic engagement
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;