"use client";
import React from "react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { motion } from "framer-motion";
import { 
  Target, 
  MessageCircle, 
  Search, 
  Calendar, 
  GraduationCap, 
  Globe, 
  Users, 
  Award,
  ArrowRight,
  Star,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { GradientButton } from "./ui/gradient-button";

interface HeroScrollDemoProps {
  onNavigate: (page: string) => void;
}

export function HeroScrollDemo({ onNavigate }: HeroScrollDemoProps) {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="space-y-8">
            {/* Main Hero Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4"
                >
                  <GraduationCap className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Discover Your
                <br />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 bg-clip-text text-transparent">
                  Perfect University
                </span>
                <br />
                Match with AI
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                AI-powered recommendations, personalized guidance, and comprehensive tracking 
                for your university application journey. Join thousands of students who found 
                their dream university with EduVantage.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <GradientButton
                  onClick={() => onNavigate('recommender')}
                  className="group flex items-center space-x-2"
                >
                  <Target className="h-5 w-5" />
                  <span>Get Recommendations</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
                
                <GradientButton
                  variant="variant"
                  onClick={() => onNavigate('chat')}
                  className="group flex items-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with AI Advisor</span>
                </GradientButton>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">10K+</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Universities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-500 mb-2">50K+</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">95%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        }
      >
        {/* Dashboard Preview */}
        <div className="h-full w-full bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 p-4 md:p-8">
          <div className="h-full w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Mock Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">EduVantage</div>
                    <div className="text-xs text-gray-500">AI University Advisory</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Online</span>
                </div>
              </div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="p-6 space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome back, Student!</h2>
                <p className="text-emerald-100">Ready to find your perfect university match?</p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Search className="h-6 w-6" />
                    <h3 className="font-semibold">Browse Universities</h3>
                  </div>
                  <p className="text-emerald-100 text-sm">Explore 10,000+ programs worldwide</p>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="h-6 w-6" />
                    <h3 className="font-semibold">AI Recommendations</h3>
                  </div>
                  <p className="text-teal-100 text-sm">Get personalized matches</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <MessageCircle className="h-6 w-6" />
                    <h3 className="font-semibold">AI Advisor</h3>
                  </div>
                  <p className="text-green-100 text-sm">24/7 expert guidance</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-6 w-6" />
                    <h3 className="font-semibold">Deadline Tracker</h3>
                  </div>
                  <p className="text-orange-100 text-sm">Never miss an application</p>
                </div>
              </div>

              {/* Mock Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">100%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Profile Complete</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-600 mb-1">5</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Applications</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">12</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 bg-clip-text text-transparent"> University Success</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From discovery to enrollment, our AI-powered platform guides you through every step of your university journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Smart Matching",
                description: "AI analyzes 50+ factors including your academic profile, preferences, and career goals to find perfect university matches.",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                icon: MessageCircle,
                title: "24/7 AI Advisor",
                description: "Get instant answers about admissions, requirements, scholarships, and application strategies from our intelligent chatbot.",
                color: "from-teal-500 to-teal-600"
              },
              {
                icon: Search,
                title: "Comprehensive Database",
                description: "Browse 10,000+ universities and programs worldwide with detailed information, requirements, and deadlines.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Calendar,
                title: "Deadline Management",
                description: "Track application deadlines with automated reminders and never miss important dates for your dream universities.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Award,
                title: "Scholarship Finder",
                description: "Discover scholarship opportunities tailored to your profile and get guidance on application strategies.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: Users,
                title: "Expert Guidance",
                description: "Access personalized advice from education consultants and connect with current students and alumni.",
                color: "from-cyan-500 to-cyan-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Success Stories from
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 bg-clip-text text-transparent"> Our Students</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of students who achieved their dreams with EduVantage's AI-powered guidance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                university: "Stanford University",
                program: "Computer Science MS",
                quote: "EduVantage's AI recommendations helped me discover programs I never knew existed. The personalized guidance was invaluable!",
                rating: 5
              },
              {
                name: "Ahmed Hassan",
                university: "MIT",
                program: "Electrical Engineering PhD",
                quote: "The deadline tracker and AI advisor made my application process so much smoother. I got into my dream school!",
                rating: 5
              },
              {
                name: "Maria Rodriguez",
                university: "Oxford University",
                program: "International Relations MA",
                quote: "From university selection to scholarship applications, EduVantage guided me through every step. Highly recommended!",
                rating: 5
              }
            ].map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{story.quote}"</p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="font-bold text-gray-900 dark:text-white">{story.name}</div>
                  <div className="text-emerald-600 font-medium">{story.program}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">{story.university}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect University?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who discovered their dream universities with our AI-powered platform. 
              Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton
                onClick={() => onNavigate('recommender')}
                className="group flex items-center justify-center space-x-2 bg-white text-emerald-600 hover:bg-gray-100"
              >
                <Target className="h-5 w-5" />
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
              <GradientButton
                variant="variant"
                onClick={() => onNavigate('browse')}
                className="group flex items-center justify-center space-x-2 border-2 border-white text-white hover:bg-white hover:text-emerald-600"
              >
                <Search className="h-5 w-5" />
                <span>Browse Universities</span>
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}