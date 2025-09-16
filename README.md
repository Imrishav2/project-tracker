# Project Completion Tracker

An enterprise-ready full-stack web application for tracking and managing mandatory project completion submissions from contributors.

## Features

- **Frontend**: React + TailwindCSS with responsive design
- **Backend**: Python Flask with SQLAlchemy ORM
- **Authentication**: Secure admin login with JWT tokens
- **File Upload**: Screenshot and ZIP folder submission with validation (up to 50MB)
- **Public Submissions Page**: Clean gallery view with search functionality
- **Admin Dashboard**: Table view with search, filter, and sort capabilities
- **Database**: SQLite (dev) or PostgreSQL (prod) with SQLAlchemy
- **Deployment**: Docker support and Render/Netlify deployment configurations

## Recent Improvements

### Frontend Enhancements
- **Simplified User Interface**: Clean, modern design with intuitive navigation
- **Improved User Experience**: Enhanced form validation and clear error messaging
- **Better Performance**: Optimized components and reduced bundle size
- **Mobile Responsiveness**: Works seamlessly on all device sizes
- **User-Friendly Messaging**: Clear instructions and feedback throughout the application

### Backend Features
- **Folder Upload Support**: Users can upload entire project folders as ZIP files
- **AI Agent Tracking**: Field to track which AI agent was used for project generation
- **Secure Authentication**: JWT-based authentication for admin access
- **Database Flexibility**: SQLite for development, PostgreSQL for production
- **Scalable Architecture**: Docker support for easy deployment and scaling

## Project Structure

```
project-tracker/
├── backend/
│   ├── app.py          # Main Flask application
│   ├── auth.py         # Authentication module
│   ├── models.py       # Database models
│   ├── requirements.txt # Python dependencies
│   ├── .env            # Environment variables
│   ├── uploads/        # Uploaded files (screenshots and projects)
│   ├── wsgi.py         # WSGI entry point for Render deployment
│   └── database.db     # SQLite database
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Main application component
│   │   ├── FormPage.jsx # Submission form component
│   │   ├── PublicSubmissionsPage.jsx # Public gallery component
│   │   ├── api.js      # API utility functions
│   │   ├── components/ # UI components
│   │   │   └── LandingPage.jsx # Homepage component
│   │   └── apiConfig.js # API configuration
│   ├── package.json    # Node.js dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── netlify.toml        # Netlify deployment configuration
├── render.yaml         # Render deployment configuration
├── requirements.txt    # Root requirements for Render deployment
├── Dockerfile          # Production Docker configuration
├── docker-compose.yml  # Multi-container Docker setup
├── README.md           # This file
├── novelty.md          # Project uniqueness documentation
└── LICENSE             # License information
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- Docker (optional, for containerized deployment)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

5. Initialize the database:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Running with Docker

### Development Mode

1. Start both frontend and backend services:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Mode

1. Use the production docker-compose file:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

2. For production deployment, set environment variables:
   ```bash
   SECRET_KEY=your-production-secret-key
   JWT_SECRET_KEY=your-production-jwt-secret-key
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register new admin user
- `POST /api/login` - Login and get JWT token

### Submissions
- `POST /api/submit` - Submit a new project (requires form data with screenshot or ZIP file)
- `GET /api/submissions` - Get all submissions (requires admin authentication)
- `GET /api/public/submissions` - Get public submissions (no authentication required)

## Environment Variables

Create a `.env` file in the backend directory with these variables:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///database.db
UPLOAD_FOLDER=uploads
JWT_SECRET_KEY=your-jwt-secret-key-here
```

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Deployment

### Running Locally

To run the project locally:

1. Start the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Frontend Deployment to Netlify

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to Netlify:
   - Go to [Netlify](https://netlify.com)
   - Create a new site
   - Select your repository
   - Set build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Set environment variables:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Deploy site

#### Troubleshooting
If you encounter deployment errors:
1. Check that all dependencies in `frontend/package.json` are correctly specified
2. Ensure the `VITE_API_URL` environment variable is set correctly
3. Check the deployment logs for specific error messages

### Backend Deployment to Render

Render deployment is simplified with two options:

#### Option 1: Automatic Configuration (Recommended)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Render will automatically detect and use the `render.yaml` configuration

#### Option 2: Manual Configuration
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build command: `pip install -r requirements.txt`
   - Start command: `cd backend && gunicorn --bind 0.0.0.0:$PORT wsgi:application`
   - Environment variables:
     - `SECRET_KEY` = your-secret-key
     - `JWT_SECRET_KEY` = your-jwt-secret-key
     - `DATABASE_URL` = sqlite:///database.db (or PostgreSQL for production)
     - `UPLOAD_FOLDER` = uploads

4. Deploy the service

#### Troubleshooting
If you encounter deployment errors:
1. Check that the root `requirements.txt` file contains only the dependencies used in your application
2. Ensure all dependencies are compatible with Render's Python environment
3. Check the deployment logs for specific error messages

### Docker Deployment

The project includes Docker support for easy deployment:

- Development: `docker-compose up --build`
- Production: `docker-compose -f docker-compose.prod.yml up --build`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.