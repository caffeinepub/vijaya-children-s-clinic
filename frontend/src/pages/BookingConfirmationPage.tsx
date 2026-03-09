import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Phone } from 'lucide-react';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="border-2 bg-card/90 backdrop-blur shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-vijaya-green-100 to-vijaya-cyan-100 p-4">
              <CheckCircle2 className="w-16 h-16 text-secondary" />
            </div>
          </div>
          <CardTitle className="text-3xl text-primary">Appointment Request Received!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for choosing Vijaya Children's Clinic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-vijaya-cyan-50 to-vijaya-blue-50 p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg text-primary">What happens next?</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Our staff will review your appointment request shortly.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  We will contact you at the phone number you provided to confirm your appointment time.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Please keep your phone accessible for our confirmation call.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-vijaya-green-50 to-vijaya-cyan-50 p-4 rounded-lg flex items-center gap-3">
            <Phone className="w-6 h-6 text-secondary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">For urgent inquiries, call us at:</p>
              <a
                href="tel:9363716343"
                className="text-lg font-semibold text-primary hover:underline"
              >
                93637 16343
              </a>
              <p className="text-xs text-muted-foreground">Mon to Sat | 7 PM to 9 PM</p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              size="lg" 
              onClick={() => navigate({ to: '/' })}
            >
              Return to Home
            </Button>
            <Button
              className="w-full border-2 border-primary text-primary hover:bg-primary/10"
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: '/book' })}
            >
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
