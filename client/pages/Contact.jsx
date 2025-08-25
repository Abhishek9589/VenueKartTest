import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const contactInfo = [
  {
    title: "Email Us",
    description: "Send us an email anytime",
    value: "info@venuekart.in",
    icon: Mail
  },
  {
    title: "Call Us",
    description: "Mon-Fri from 8am to 5pm",
    value: "8806621666",
    icon: Phone
  },
  {
    title: "Visit Us",
    description: "Come say hello at our office",
    value: "Pune, Maharashtra, India",
    icon: MapPin
  },
  {
    title: "Working Hours",
    description: "Our team is available",
    value: "Mon-Fri: 9AM-7PM",
    icon: Clock
  }
];

export default function Contact() {
  const [result, setResult] = React.useState("");

  const onSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const subject = formData.get("subject");
    const message = formData.get("message");

    // Construct the email body
    const emailBody = `
Hi,

I am reaching out through the VenueKart contact form.

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Subject: ${subject}

Message:
${message}

Best regards,
${name}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:info@venuekart.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    setResult("Opening your email client with the message pre-filled. Just click send!");

    // Reset form after a brief delay
    setTimeout(() => {
      event.target.reset();
      setResult("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Text Over Image */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content Over Image */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Have questions about venues or need help with your booking? We're here to help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-venue-dark mb-6">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-8">
              Reach out to us through any of these channels. We're always ready to assist you.
            </p>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-venue-indigo" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-venue-dark mb-1">{info.title}</h3>
                      <p className="text-gray-600 text-sm mb-1">{info.description}</p>
                      <p className="text-venue-indigo font-medium">{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-venue-dark font-bold">Send us a Message</CardTitle>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Enter your full name"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        placeholder="What is this about?"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className="border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200 resize-none"
                    />
                  </div>

                  {result && (
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border ${
                      result.includes("Successfully")
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {result.includes("Successfully") ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{result}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-venue-indigo hover:bg-venue-purple text-white h-14 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
