# CI/CD Pipeline Builder

A modern, full-stack CI/CD pipeline generator with beautiful pastel SaaS design. Built with React, Node.js, and Express for complete pipeline generation and simulation.

## 🚀 Features

### Frontend (React + Vite)
- **Modern Pastel SaaS UI**: Clean, professional interface with soft pastel colors
- **Platform Selection**: Support for GitHub Actions, AWS CodePipeline, and Jenkins
- **Configuration Panel**: Dropdown selectors for programming languages and deployment types
- **Live Preview**: Terminal-style code preview with syntax highlighting
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Pastel Theme**: Soft teal, peach, and warm white color scheme
- **Smooth Animations**: Hover effects, transitions, and subtle animations
- **Quicksand Font**: Clean, modern typography from Google Fonts

### Backend (Node.js + Express)
- **RESTful API**: Complete API endpoints for pipeline generation
- **Template System**: 20+ high-quality CI/CD templates
- **Pipeline Simulator**: Realistic pipeline execution simulation
- **Error Handling**: Comprehensive error handling and fallbacks
- **Production Ready**: Clean architecture with controllers, routes, and services

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript** - Plain JavaScript (no TypeScript)
- **Quicksand & Fira Code** - Google Fonts

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Body Parser** - Request parsing middleware

## 📁 Project Structure

```
cicd-pipeline-builder/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Platform selection sidebar
│   │   │   ├── Header.jsx           # Header with title and animation
│   │   │   ├── ControlPanel.jsx     # Configuration dropdowns
│   │   │   ├── CodePreview.jsx      # Terminal-style preview
│   │   │   └── ActionButtons.jsx    # Action buttons (Copy, Download, Reset)
│   │   ├── App.jsx                  # Main application component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles and Tailwind imports
│   ├── index.html                   # HTML template with fonts
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind configuration
│   └── postcss.config.js            # PostCSS configuration
├── backend/                         # Node.js API server
│   ├── controllers/
│   │   └── pipelineController.js    # API request handlers
│   ├── routes/
│   │   └── pipelineRoutes.js        # API route definitions
│   ├── services/
│   │   ├── generatorService.js      # Pipeline generation logic
│   │   └── simulatorService.js      # Pipeline simulation logic
│   ├── data/
│   │   └── templates.js             # CI/CD template definitions
│   ├── server.js                    # Express server entry point
│   └── package.json                 # Backend dependencies
└── README.md                        # This file
```

## 🎨 Design System

### Pastel Color Palette
- **Primary**: `#C0E1D2` (soft teal)
- **Secondary**: `#E5EEE4` (light green)
- **Background**: `#F6F4E8` (warm white)
- **Accent**: `#DC9B9B` (soft peach)
- **Text**: `#1F2937` (dark gray)

### Typography
- **Primary Font**: Quicksand (Google Fonts)
- **Monospace Font**: Fira Code (for code)
- **Weights**: 400, 500, 600, 700

### Components
- **Sidebar**: Gradient teal sidebar with rounded edges
- **Header**: Light background with floating animation
- **Control Panel**: Card-style container with pastel inputs
- **Code Preview**: Light terminal-style with gradient overlay
- **Action Buttons**: Gradient pastel buttons with hover effects

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Setup

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```
   *Backend runs on `http://localhost:3001`*

4. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`*

5. **Open in browser:**
   Navigate to `http://localhost:5173`

### Development Mode (Backend)
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend (no build needed - Node.js is interpreted)
cd backend
npm start
```

## 📱 Responsive Design

- **Desktop**: Full sidebar + main content layout
- **Mobile**: Collapsible sidebar with stacked layout
- **Tablet**: Optimized spacing and component sizing

## 📡 API Endpoints

### Generate Pipeline
```http
POST /api/generate
Content-Type: application/json

{
  "platform": "github",
  "language": "node", 
  "deployment": "docker"
}
```

### Simulate Pipeline
```http
POST /api/simulate
Content-Type: application/json

{
  "pipelineCode": "name: CI/CD Pipeline...",
  "mode": "full" // or "quick"
}
```

### Get Templates
```http
GET /api/templates
```

### Get Available Options
```http
GET /api/platforms
GET /api/languages?platform=github
GET /api/deployments?platform=github&language=node
```

## 🎯 Current Features

✅ **Complete Full-Stack Application**
- Modern pastel SaaS UI design
- Complete REST API backend
- Real-time pipeline generation
- Error handling and fallbacks
- Loading states and animations

✅ **Backend Architecture**
- Clean MVC pattern
- 20+ CI/CD templates
- Pipeline simulation service
- Production-ready error handling

✅ **Frontend Features**
- Responsive design
- API integration with fallbacks
- Copy/Download functionality
- Modern pastel theme

✅ **Professional Styling**
- Soft pastel color palette
- Quicksand and Fira Code fonts
- Smooth animations and transitions
- Card-based component design

## � Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Render/Railway)
```bash
cd backend
npm start
# Deploy to Render or Railway
```

## 🛠️ Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📄 License

MIT License - feel free to use this project for your own CI/CD pipeline needs.

## 🤝 Contributing

This is a complete full-stack application. Contributions for new features, templates, and improvements are welcome!

## 🔧 Troubleshooting

### Backend Connection Issues
If you see "Backend Connection Error":
1. Ensure backend server is running on port 3001
2. Check console for CORS errors
3. Verify API endpoints are accessible

### Template Issues
If templates don't load:
1. Check backend/templates.js file
2. Verify template structure
3. Check API response format

### Build Issues
If build fails:
1. Check all dependencies are installed
2. Verify Tailwind CSS configuration
3. Check for syntax errors in components
