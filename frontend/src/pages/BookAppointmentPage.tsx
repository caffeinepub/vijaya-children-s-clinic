import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useCreateAppointment } from '../hooks/useQueries';
import { Loader2, Phone } from 'lucide-react';
import { AppointmentStatus } from '../backend';

const TIME_SLOTS = [
  '07:00 PM',
  '07:15 PM',
  '07:30 PM',
  '07:45 PM',
  '08:00 PM',
  '08:15 PM',
  '08:30 PM',
  '08:45 PM',
  '09:00 PM',
];

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();

  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    childAge: '',
    phoneNumber: '',
    email: '',
    reason: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.parentName.trim()) newErrors.parentName = 'Parent/Guardian name is required';
    if (!formData.childName.trim()) newErrors.childName = 'Child name is required';
    if (!formData.childAge.trim()) newErrors.childAge = 'Child age is required';
    else if (isNaN(Number(formData.childAge)) || Number(formData.childAge) < 0) {
      newErrors.childAge = 'Please enter a valid age';
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!selectedDate) newErrors.date = 'Please select a preferred date';
    if (!selectedTime) newErrors.time = 'Please select a preferred time';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createAppointment.mutateAsync({
        parentName: formData.parentName,
        childName: formData.childName,
        childAge: BigInt(formData.childAge),
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        preferredDate: BigInt(selectedDate!.getTime() * 1_000_000),
        preferredTime: selectedTime,
        reason: formData.reason,
        submissionTime: BigInt(Date.now() * 1_000_000),
        status: AppointmentStatus.pending,
      });

      navigate({ to: '/confirmation' });
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setErrors({ submit: 'Failed to submit appointment. Please try again.' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Book an Appointment</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Fill in the details below and we'll get back to you to confirm your appointment.
        </p>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-vijaya-cyan-100 to-vijaya-green-100 text-primary px-4 py-2 rounded-lg shadow-md">
          <Phone className="w-5 h-5" />
          <span className="font-semibold">
            Call us:{' '}
            <a href="tel:9363716343" className="hover:underline">
              93637 16343
            </a>
          </span>
          <span className="text-sm">| Mon to Sat | 7 PM to 9 PM</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Parent & Child Information */}
          <Card className="bg-card/90 backdrop-blur border-2">
            <CardHeader>
              <CardTitle className="text-primary">Parent & Child Information</CardTitle>
              <CardDescription>Please provide your contact details and your child's information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">
                    Parent/Guardian Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => handleInputChange('parentName', e.target.value)}
                    placeholder="Enter your name"
                    className={errors.parentName ? 'border-destructive' : ''}
                  />
                  {errors.parentName && <p className="text-sm text-destructive">{errors.parentName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    className={errors.phoneNumber ? 'border-destructive' : ''}
                  />
                  {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">
                    Child's Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => handleInputChange('childName', e.target.value)}
                    placeholder="Enter child's name"
                    className={errors.childName ? 'border-destructive' : ''}
                  />
                  {errors.childName && <p className="text-sm text-destructive">{errors.childName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childAge">
                    Child's Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="childAge"
                    type="number"
                    min="0"
                    value={formData.childAge}
                    onChange={(e) => handleInputChange('childAge', e.target.value)}
                    placeholder="Enter age in years"
                    className={errors.childAge ? 'border-destructive' : ''}
                  />
                  {errors.childAge && <p className="text-sm text-destructive">{errors.childAge}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card className="bg-card/90 backdrop-blur border-2">
            <CardHeader>
              <CardTitle className="text-primary">Preferred Date & Time</CardTitle>
              <CardDescription>
                Select your preferred appointment date and time slot (Mon to Sat, 7 PM to 9 PM).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>
                  Preferred Date <span className="text-destructive">*</span>
                </Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      // Disable Sundays (day 0) and past dates
                      return date < today || date.getDay() === 0;
                    }}
                    className="rounded-md border"
                  />
                </div>
                {errors.date && <p className="text-sm text-destructive text-center">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Preferred Time <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => {
                        setSelectedTime(time);
                        if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Reason for Visit */}
          <Card className="bg-card/90 backdrop-blur border-2">
            <CardHeader>
              <CardTitle className="text-primary">Reason for Visit</CardTitle>
              <CardDescription>Please describe the reason for your appointment (optional).</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="E.g., Routine checkup, vaccination, fever, etc."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col gap-3">
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                {errors.submit}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Appointment Request'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
