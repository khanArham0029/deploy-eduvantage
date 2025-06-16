# EduVantage - AI University Advisory System

EduVantage is an AI-powered university advisory platform that helps students find their perfect university matches through personalized recommendations, intelligent chat assistance, and comprehensive application tracking.

## 🌟 Features

### 🎯 Smart University Matching
- AI-powered recommendations based on 50+ factors
- Personalized matches considering academic profile, preferences, and career goals
- Comprehensive university database with 10,000+ programs worldwide

### 💬 24/7 AI Advisor
- Intelligent chatbot for instant guidance
- Expert advice on admissions, requirements, and application strategies
- Context-aware conversations with chat history

### 📅 Application Deadline Tracker
- Smart deadline management with automated reminders
- Customizable notification preferences (daily or milestone reminders)
- Priority-based application tracking

### 🔍 University Browser
- Advanced search and filtering capabilities
- Detailed program information and requirements
- Real-time data on tuition, deadlines, and admission criteria

### 📄 CV-Powered Profile Setup
- Automatic profile completion from CV upload
- AI extraction of academic and professional information
- Support for PDF, DOC, DOCX, and TXT formats

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Edge Functions** for serverless API endpoints

### AI Integration
- **FastAPI** backend for AI processing (separate deployment)
- **Vector embeddings** for semantic search
- **RAG (Retrieval-Augmented Generation)** for contextual responses

### Email System
- **Mailjet** for transactional emails
- **Automated reminder system** for application deadlines

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Mailjet account (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/eduvantage.git
cd eduvantage
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and update with your credentials:
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Database Setup
The database schema is automatically applied through Supabase migrations. Key tables include:
- `users` - User profiles and preferences
- `universities` & `courses` - University and program data
- `chat_sessions` & `chat_messages` - Chat history
- `application_deadlines` & `deadline_reminders` - Deadline tracking

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── AuthForm.tsx     # Authentication
│   ├── Dashboard.tsx    # Main dashboard
│   ├── ChatInterface.tsx # AI chat system
│   ├── DeadlineTracker.tsx # Application tracking
│   └── ...
├── hooks/               # Custom React hooks
├── contexts/            # React contexts (theme, etc.)
├── lib/                 # Utilities and configurations
└── main.tsx            # Application entry point

supabase/
├── functions/           # Edge functions
│   ├── chat-with-ai/   # AI chat proxy
│   ├── extract-cv-data/ # CV processing
│   └── send-deadline-reminders/ # Email notifications
└── migrations/          # Database schema migrations
```

## 🔧 Key Components

### Authentication System
- Email/password authentication via Supabase Auth
- Row Level Security (RLS) for data protection
- User profile management with preferences

### AI Chat System
- Session-based conversations
- Integration with external AI services
- Source citation and context awareness
- Message persistence and history

### University Recommendation Engine
- Multi-factor matching algorithm
- User preference analysis
- Real-time filtering and search
- Detailed program comparisons

### Deadline Management
- Automated reminder scheduling
- Multiple notification types (immediate, daily, milestone)
- Email integration with professional templates
- Priority-based organization

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages

### Backend Services
- **Supabase**: Handles database, authentication, and edge functions
- **FastAPI**: Separate deployment for AI processing (Railway, Heroku, etc.)
- **Mailjet**: Email service integration

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Environment variable protection
- Input validation and sanitization
- CORS configuration for API endpoints

## 📱 Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface
- Progressive Web App (PWA) capabilities

## 🎨 Design System

- Consistent color palette with dark/light mode support
- Typography scale with proper hierarchy
- Component-based architecture
- Accessibility-first design principles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Supabase for the excellent backend-as-a-service platform
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Lucide React for beautiful icons

## 📞 Support

For support, email support@eduvantage.com or join our Discord community.

---

Built with ❤️ by the EduVantage team