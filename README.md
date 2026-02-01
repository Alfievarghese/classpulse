# ClassPulse 📊

**Real-time anonymous classroom feedback system** - A modern web application that allows students to vote on topics and provide anonymous feedback during class sessions.

## 🌟 Features

- **Zero-Auth Student Access** - Students join using only a 4-digit code
- **Real-time Synchronization** - Updates reflect instantly (<500ms) across all devices
- **Anonymous Voting** - No accounts required, session-based voting
- **Student-Generated Topics** - Students can add new discussion topics
- **Projector Mode** - High-contrast fullscreen view for classroom TVs
- **Mobile-First Design** - Optimized for smartphones and tablets
- **Accessibility** - WCAG AA compliant with proper ARIA labels

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Routing**: React Router v6

### Three Views

1. **Teacher Dashboard** (`/teacher/create`, `/teacher/:sessionId`)
   - Create sessions with initial topics
   - View live voting statistics
   - Access projector mode

2. **Student Interface** (`/join`, `/student/:sessionId`)
   - Join with 4-digit code
   - One-tap voting on topics
   - Add new topics

3. **Projector View** (`/projector/:sessionId`)
   - Fullscreen high-contrast display
   - Real-time bar charts
   - Visual indicators for high-vote topics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd d:/classrom
   npm install
   ```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `schema.sql`
   - Copy your project URL and anon key

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

### For Teachers

1. Navigate to `/teacher/create`
2. Enter class subject and optional initial topics
3. Click "Create Session"
4. Share the 4-digit code with students
5. Open "Projector View" for classroom display

### For Students

1. Navigate to `/join` (default landing page)
2. Enter the 4-digit code from teacher
3. Vote on existing topics or add new ones
4. Watch real-time updates

## 🗄️ Database Schema

The app uses three main tables:

- **sessions** - Class sessions with unique 4-digit codes
- **topics** - Votable topics within sessions
- **votes** - Individual votes with duplicate prevention

See `SUPABASE_SETUP.md` for complete SQL schema.

## 🎨 Design System

**Professional Academic Theme**:
- **Navy** (#1e3a8a) - Headers and primary text
- **Blue** (#3b82f6) - Primary actions
- **Sky** (#0ea5e9) - Accents
- **Success** (#10b981) - Low-priority votes
- **Warning** (#f59e0b) - Medium-priority votes
- **Danger** (#ef4444) - High-priority votes

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Anonymous voting via session tokens (localStorage)
- No user authentication required
- Session-based vote tracking prevents duplicates

## 🧪 Testing

### Manual Testing Workflow

1. **Create a session** as teacher
2. **Open student view** in incognito window
3. **Join using code** and vote on topics
4. **Add a new topic** as student
5. **Verify real-time updates** in projector view
6. **Test mobile responsiveness** on actual device

## 📱 Responsive Design

- **Mobile**: 320px - 767px (optimized for voting)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+ (teacher dashboard, projector)

## ♿ Accessibility

- Minimum 44px touch targets for mobile
- WCAG AA color contrast ratios
- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly

## 📄 License

MIT License - Feel free to use for educational purposes

## 🙏 Acknowledgments

Built with modern web technologies to enhance classroom engagement and provide teachers with real-time feedback on student needs.

### Deployment

**Deploy to Vercel**:
1. Push this code to GitHub
2. Import the repository in Vercel
3. Add your Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel project settings
4. Deploy! 🚀

---

**Need help?** Check `schema.sql` for the database structure.
