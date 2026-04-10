import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export const metadata: Metadata = {
	title: "Accessibility | Association of Dietetics Professionals",
	description: "Our commitment to accessibility and inclusive web experiences.",
};

export default function AccessibilityPage() {
	return (
		<div className="min-h-screen">
			<section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Accessibility</h1>
						<p className="text-slate-600 text-lg">
							We strive to make our website usable for everyone, including people with disabilities.
						</p>
					</div>
				</div>
			</section>

			<section className="py-12 bg-white">
				<div className="container mx-auto px-4 max-w-4xl">
					<Card>
						<CardHeader>
							<CardTitle>Accessibility Statement</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6 text-slate-600">
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">
									<strong className="text-slate-900">Effective Date:</strong> 05/07/2025
								</p>
								<p className="text-sm text-muted-foreground">
									<strong className="text-slate-900">Last Updated:</strong> 18/09/2025
								</p>
							</div>

							<p>
								The Association of Dietetics Professionals is committed to ensuring that our website is accessible to all users,
								including individuals with disabilities. We strive to provide an inclusive online experience so that all dietetics
								professionals and visitors can access membership services, resources, and information without barriers.
							</p>

							<div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-2">Our Accessibility Commitment</h2>
								<ul className="list-disc pl-6 space-y-1">
									<li>Compliance with WCAG 2.1 AA standards</li>
									<li>Support for assistive technologies</li>
									<li>Clear and adaptable content</li>
								</ul>
							</div>

							<div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-2">Features Implemented</h2>
								<ul className="list-disc pl-6 space-y-1">
									<li>Alt text for images</li>
									<li>Screen reader-friendly headings</li>
									<li>Color contrast</li>
									<li>Adjustable text sizes</li>
									<li>Keyboard-friendly navigation</li>
									<li>Properly labeled forms</li>
								</ul>
							</div>

							<div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-2">Ongoing Improvements</h2>
								<p>
									Accessibility is an ongoing process. We regularly review our website to identify and resolve accessibility
									barriers.
								</p>
							</div>

							<div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-2">Feedback and Assistance</h2>
								<p>
									Email: <a className="underline" href="mailto:info@adp.org.in">info@adp.org.in</a> <br />
									Address: New Delhi, India <br />
									Phone: +91 8059655000
								</p>
							</div>

							<div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-2">Third-Party Content</h2>
								<p>
									Some areas may embed third-party content. While we cannot control their accessibility, we encourage compliance
									with standards.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
