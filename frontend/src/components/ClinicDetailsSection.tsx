import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Clock, MapPin, Stethoscope } from 'lucide-react';

export default function ClinicDetailsSection() {
  const services = [
    'Newborn Care',
    'Vaccination',
    'Fever',
    'Nebulization',
    'Growth Monitoring',
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-vijaya-green-50 to-vijaya-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Visit Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us for appointments and inquiries
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Services Card */}
          <Card className="border-2 bg-card/90 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Stethoscope className="w-6 h-6" />
                Our Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {services.map((service, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-secondary mr-2 font-bold">✓</span>
                    <span className="text-foreground font-medium">{service}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-2 bg-card/90 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Phone className="w-6 h-6" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">For Appointment</p>
                    <a
                      href="tel:9363716343"
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      93637 16343
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Clinic Timings</p>
                    <p className="font-semibold text-foreground">Mon to Sat | 7 PM to 9 PM</p>
                    <p className="text-sm text-muted-foreground">Sundays on appointment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground">
                      No.1, 1st street, Balaji Nagar,<br />
                      Anakaputhur, Chennai - 600 070
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="pt-4 border-t flex justify-center">
                <div className="text-center">
                  <img
                    src="/assets/generated/vijaya-clinic-qr.dim_512x512.png"
                    alt="Scan for Location / Appointment"
                    className="w-32 h-32 mx-auto rounded-lg border-2 border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan for Location / Appointment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
