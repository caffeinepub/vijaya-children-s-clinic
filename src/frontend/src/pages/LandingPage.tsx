import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ClinicDetailsSection from '@/components/ClinicDetailsSection';
import { Calendar, Clock, Heart, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments at your convenience with our simple online system.',
    },
    {
      icon: Clock,
      title: 'Flexible Timings',
      description: 'Mon to Sat | 7 PM to 9 PM - Evening hours for your convenience.',
    },
    {
      icon: Heart,
      title: 'Caring Environment',
      description: 'A warm, child-friendly clinic dedicated to your little one\'s health.',
    },
    {
      icon: Shield,
      title: 'Expert Care',
      description: 'Professional pediatric care from a qualified specialist you can trust.',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-green-100 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <img
                  src="/assets/generated/vijaya-children-clinic-logo.dim_512x512.png"
                  alt="Vijaya Children's Clinic Logo"
                  className="h-28 w-auto object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Vijaya Children's Clinic
              </h1>
              <p className="text-xl text-secondary font-medium italic">
                Growing Healthy Futures
              </p>
              <p className="text-lg text-secondary font-medium">
                குழந்தை நலனே எங்கள் முதன்மை
              </p>
              <div className="bg-card/80 backdrop-blur p-6 rounded-lg space-y-2">
                <p className="text-lg font-semibold text-primary">
                  DR. K. MANICKAVINAYAGAR M.B.B.S, M.D.
                </p>
                <p className="text-base text-muted-foreground">
                  Consultant Paediatrician - New Born and Child Specialist
                </p>
                <p className="text-sm text-muted-foreground">
                  Reg.No: 152853
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate({ to: '/book' })}
                >
                  Book Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate({ to: '/staff' })}
                >
                  Staff Portal
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/clinic-hero-illustration.dim_1600x900.png"
                alt="Clinic Illustration"
                className="w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best care for your children in a warm and welcoming environment.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow bg-card/90 backdrop-blur">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic Details Section */}
      <ClinicDetailsSection />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Ready to Schedule Your Visit?
          </h2>
          <p className="text-lg text-primary/80 mb-8 max-w-2xl mx-auto">
            Take the first step towards your child's health and wellness. Call us at{' '}
            <a href="tel:9363716343" className="font-semibold hover:underline">
              93637 16343
            </a>{' '}
            or book online now.
          </p>
          <Button
            size="lg"
            className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate({ to: '/book' })}
          >
            Book Your Appointment Now
          </Button>
        </div>
      </section>
    </div>
  );
}
