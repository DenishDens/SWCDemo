import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, FileText, Users, Database, Brain, Menu } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="relative z-30 w-full">
        <div className="container flex items-center justify-between py-4 px-4 md:px-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">CARBONLY</h1>
          </div>
          <div className="md:hidden ml-auto mr-4">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-200 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-200 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#contact" className="text-gray-200 hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="bg-white/10 text-gray-900 border-white hover:bg-white/20" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 hidden md:inline-flex" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-800/90 z-10" />
          <img
            src="/placeholder.svg?height=600&width=1200"
            alt="Sustainability background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container relative z-20 px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">CARBONLY</h1>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight max-w-3xl">
              Reduce your carbon impact today!
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
              AI-powered carbon emission tracking and analysis for organizations committed to sustainability
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-gray-800 border-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Comprehensive Carbon Management</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform helps you track, analyze, and reduce your organization's carbon footprint
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-green-600" />}
              title="AI Document Scanning"
              description="Upload any file type and our AI engine will automatically extract and analyze carbon emission data"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-green-600" />}
              title="Emission Analytics"
              description="Track emissions across Scope 1, 2, and 3 categories with detailed reporting and insights"
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-green-600" />}
              title="Predictive AI"
              description="Leverage AI predictions to forecast future emissions and identify reduction opportunities"
            />
            <FeatureCard
              icon={<Database className="h-10 w-10 text-green-600" />}
              title="Material Library"
              description="Configure and customize emission factors for accurate carbon calculations"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-green-600" />}
              title="Team Collaboration"
              description="Invite team members and external stakeholders to collaborate on sustainability projects"
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-green-600" />}
              title="REST API"
              description="Integrate carbon data with your existing systems using our comprehensive API"
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Pay only for what you need with our user-based subscription model
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter"
              price="$20"
              description="Perfect for small teams just getting started with carbon tracking"
              features={["Up to 50 users", "AI document scanning", "Basic emission analytics", "Email support"]}
              buttonText="Start Free Trial"
            />
            <PricingCard
              title="Professional"
              price="$40"
              description="For growing organizations with advanced sustainability needs"
              features={[
                "51-100 users",
                "Advanced AI analytics",
                "Custom emission factors",
                "API access",
                "Priority support",
              ]}
              buttonText="Start Free Trial"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              description="For large organizations with complex sustainability requirements"
              features={[
                "Unlimited users",
                "Advanced AI predictions",
                "Custom integrations",
                "Dedicated account manager",
                "SLA guarantees",
              ]}
              buttonText="Contact Sales"
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-slate-900 py-20 text-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Drop us a line!</p>
          </div>

          <div className="max-w-md mx-auto">
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">Send Message</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-gray-400">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">CARBONLY</h3>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Carbonly.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, description, features, buttonText, highlighted = false }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border ${highlighted ? "border-green-500 ring-2 ring-green-500 ring-opacity-50" : "border-gray-200"}`}
    >
      <div className={`p-6 ${highlighted ? "bg-green-50" : ""}`}>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          {price !== "Custom" && <span className="ml-1 text-gray-600">/user/month</span>}
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <Button className={`w-full ${highlighted ? "bg-green-600 hover:bg-green-700" : ""}`}>{buttonText}</Button>
      </div>
      <div className="px-6 pb-6">
        <ul className="space-y-3 mt-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

