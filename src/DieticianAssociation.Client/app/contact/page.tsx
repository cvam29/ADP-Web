"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { useContactStore } from "@/store/useContactStore"

const officeAddress = "RZ-96, UG Floor, Uttam Nagar, New Delhi-110059"
const officeMapsLink = `https://maps.google.com/?q=${encodeURIComponent(officeAddress)}`

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobileNumber: "",
        subject: "",
        category: "",
        message: "",
    })
    const { toast } = useToast()
    const { sendMessage, loading, success, message, error, clearMessage } = useContactStore()

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Clear any prior user-visible message after a brief delay to avoid flicker
        if (success || error) clearMessage?.()
        try {
            await sendMessage({
                name: formData.name,
                email: formData.email,
                mobileNumber: formData.mobileNumber || undefined,
                subject: formData.subject,
                message: formData.message,
                category: formData.category,
            })
            // Form reset only on success
            setFormData({
                name: "",
                email: "",
                mobileNumber: "",
                subject: "",
                category: "",
                message: "",
            })
        } catch (err) {
            // Error toast already handled inside store; optional console
            console.error('Error sending contact message:', err)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">Contact Us</h1>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Have questions about membership, events, or resources? We&rsquo;re here to help you succeed in your nutrition
                            career.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            {/* Contact Content */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 items-start lg:grid-cols-3 lg:items-stretch">

                        {/* Contact Information */}
                        <div className="flex flex-col gap-6 lg:h-full">
                            <Card className="group flex-1 flex flex-col justify-center border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 shadow-sm border border-emerald-100 group-hover:border-emerald-600">
                                        <Mail className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1.5 text-lg tracking-tight">Email</h3>
                                    <p className="text-slate-500 text-sm mb-4">Send us a message anytime</p>
                                    <a
                                        href="mailto:info@adp.org.in"
                                        className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition-colors break-all"
                                    >
                                        info@adp.org.in
                                    </a>
                                </CardContent>
                            </Card>

                            <Card className="group flex-1 flex flex-col justify-center border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 shadow-sm border border-emerald-100 group-hover:border-emerald-600">
                                        <Phone className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1.5 text-lg tracking-tight">Phone</h3>
                                    <p className="text-slate-500 text-sm mb-4">Call us during business hours</p>
                                    <a href="tel:+918059655000" className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition-colors">
                                        +91 80596 55000
                                    </a>
                                </CardContent>
                            </Card>

                            <Card className="group flex-1 flex flex-col justify-center border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 shadow-sm border border-emerald-100 group-hover:border-emerald-600">
                                        <MapPin className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1.5 text-lg tracking-tight">Address</h3>
                                    <p className="text-slate-500 text-sm mb-4">Visit our headquarters</p>
                                    <a
                                        href={officeMapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition-colors leading-relaxed"
                                    >
                                        RZ-96, UG Floor, Uttam Nagar
                                        <br />
                                        New Delhi-110059
                                    </a>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="flex lg:col-span-2 lg:h-full">
                            <Card className="flex-1 flex flex-col border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Send us a Message</CardTitle>
                                    <CardDescription>
                                        Fill out the form below and we&rsquo;ll get back to you as soon as possible.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <form method="post" onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => handleInputChange("category", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="membership">Membership</SelectItem>
                                                        <SelectItem value="events">Events</SelectItem>
                                                        <SelectItem value="resources">Resources</SelectItem>
                                                        <SelectItem value="technical">Technical Support</SelectItem>
                                                        <SelectItem value="billing">Billing</SelectItem>
                                                        <SelectItem value="general">General Inquiry</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="mobile">Mobile Number (optional)</Label>
                                                <Input
                                                    id="mobile"
                                                    type="tel"
                                                    value={formData.mobileNumber}
                                                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                                                    placeholder="e.g. +91 98765 43210"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                                placeholder="Brief subject line"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 flex-1 flex flex-col">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea
                                                id="message"
                                                value={formData.message}
                                                onChange={(e) => handleInputChange("message", e.target.value)}
                                                placeholder="Please provide details about your inquiry..."
                                                rows={6}
                                                required
                                                className="flex-1"
                                            />
                                        </div>

                                        {success && message && (
                                            <p className="text-sm text-emerald-600 border border-emerald-200 rounded-md p-2 bg-emerald-50">{message}</p>
                                        )}
                                        {error && (
                                            <p className="text-sm text-red-600 border border-red-200 rounded-md p-2 bg-red-50">{error}</p>
                                        )}
                                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </section>



            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                            <p className="text-lg text-slate-600">
                                Quick answers to common questions about our association and services.
                            </p>
                        </div>
                        <div className="max-w-2xl mx-auto">
                            <Accordion type="single" collapsible className="space-y-4">
                                <AccordionItem value="faq1">
                                    <AccordionTrigger className="text-lg">How do I become a member?</AccordionTrigger>
                                    <AccordionContent>
                                        Visit our membership page to choose a plan that fits your needs. You can register online and start accessing resources immediately.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="faq2">
                                  <AccordionTrigger className="text-lg">
  How to download the certificate?
</AccordionTrigger>
<AccordionContent>
  To download your certificate, follow these steps:
  <ol className="list-decimal ml-5 mt-2 space-y-1">
    <li>Click on your <strong>Profile</strong> icon.</li>
    <li>Navigate to the <strong>Profile</strong> section.</li>
    <li>Open the <strong>Certificates</strong> tab.</li>
    <li>Click <strong>Preview</strong> to view your certificate.</li>
    <li>Click <strong>Download</strong> to save the certificate.</li>
  </ol>
</AccordionContent>

                                </AccordionItem>
                                <AccordionItem value="faq3">
                                    <AccordionTrigger className="text-lg">Can I access resources offline?</AccordionTrigger>
                                    <AccordionContent>
                                        Many of our resources are downloadable PDFs and documents that you can save and access offline. Check individual resource pages for download options.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="faq4">
                                    <AccordionTrigger className="text-lg">What payment methods do you accept?</AccordionTrigger>
                                    <AccordionContent>
                                        We accept upi and bank transfers. Institutional billing options are also available for organizations.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}