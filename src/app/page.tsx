import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldHalf, BrainCircuit, SearchCode, ArrowRight } from 'lucide-react';

const Header = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 max-w-screen-2xl items-center">
      <div className="mr-4 flex">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShieldHalf className="h-6 w-6 text-primary" />
          <span className="font-bold">NIP</span>
        </Link>
      </div>
      <nav className="flex flex-1 items-center justify-end space-x-6 text-sm font-medium">
        <Link href="/dashboard" className="text-foreground/60 transition-colors hover:text-foreground/80">Dashboard</Link>
        <Link href="/dashboard/reports" className="text-foreground/60 transition-colors hover:text-foreground/80">Reports</Link>
        <Link href="/dashboard/alerts" className="text-foreground/60 transition-colors hover:text-foreground/80">Alerts</Link>
        <Link href="/dashboard/settings" className="text-foreground/60 transition-colors hover:text-foreground/80">Settings</Link>
      </nav>
    </div>
  </header>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="glassmorphism group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
    <CardContent className="p-6 text-center">
      <div className="mb-4 inline-block rounded-lg bg-primary/10 p-4">{icon}</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-foreground/60">{description}</p>
    </CardContent>
  </Card>
);

const RecentActivityCard = ({ platform, user, message, risk }: { platform: string, user: string, message: string, risk: 'High' | 'Medium' | 'Low' }) => {
  const riskColor = risk === 'High' ? 'bg-red-500' : risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-80 flex-shrink-0">
      <Card className="glassmorphism h-full">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold">{user}</span>
            <Badge className={`${riskColor} text-primary-foreground`}>{risk} Risk</Badge>
          </div>
          <p className="text-sm text-foreground/70">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black via-background to-background/50 opacity-80"
            style={{
                backgroundImage: `radial-gradient(circle at top left, hsl(var(--primary)/0.1), transparent 40%),
                                  radial-gradient(circle at bottom right, hsl(var(--primary)/0.15), transparent 50%)`,
              }}
          />
          <div className="container relative z-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl text-balance">
              Combating Digital Narcotics Trafficking
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80 md:text-xl">
              Detect. Analyze. Intervene.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button size="lg" className="animated-gradient-border-button group bg-primary/10 text-primary hover:bg-primary/20">
                  <div className="relative z-10 flex h-full w-full items-center justify-center rounded-md bg-background px-8 py-3 transition-colors group-hover:bg-transparent">
                    Launch Dashboard <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Platform Capabilities</h2>
              <p className="mt-4 text-foreground/60">
                Leveraging cutting-edge technology to stay ahead of illicit activities.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard 
                icon={<ShieldHalf className="h-8 w-8 text-primary" />} 
                title="Real-Time Monitoring" 
                description="Actively monitor public channels and groups across major platforms for suspicious activities."
              />
              <FeatureCard 
                icon={<BrainCircuit className="h-8 w-8 text-primary" />} 
                title="AI-Powered Analysis" 
                description="Utilize advanced AI to analyze text, images, and user behavior for trafficking indicators."
              />
              <FeatureCard 
                icon={<SearchCode className="h-8 w-8 text-primary" />} 
                title="OSINT Integration" 
                description="Cross-reference usernames and data points to uncover linked identities and networks."
              />
            </div>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section id="activity" className="py-20 md:py-28 bg-secondary/30">
          <div className="container">
            <h2 className="mb-8 text-center text-3xl font-bold">Recent Intelligence Feed</h2>
            <div className="flex w-full overflow-x-auto space-x-6 pb-4">
              <RecentActivityCard platform="Telegram" user="@coke_dealer_nyc" message="New batch of 'snow' just arrived. DM for menu. ❄️" risk="High" />
              <RecentActivityCard platform="Instagram" user="partysupplies_uk" message="Weekend party favours ready for the festival! 🍬" risk="Medium" />
              <RecentActivityCard platform="WhatsApp" user="Secret Rave Group" message="Got some fire molly for this weekend. Hit me up." risk="High" />
              <RecentActivityCard platform="Telegram" user="@chemcentral" message="Looking for psychonauts to give feedback on new chems." risk="Medium" />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="mt-4 text-lg text-foreground/70 text-balance">
              The Narcotics Intelligence Platform is a dedicated tool designed to empower law enforcement agencies. By providing advanced monitoring and analysis capabilities, we aim to disrupt online drug trafficking networks, reduce the flow of illicit substances, and create safer communities.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-foreground/60">&copy; {new Date().getFullYear()} NIP. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link href="#" className="text-foreground/60 hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-foreground/60 hover:text-primary">Terms of Use</Link>
            <Link href="#" className="text-foreground/60 hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
