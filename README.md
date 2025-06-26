# 🚀 Ayan Blog - AI-Powered Content Creation Platform

A full-stack web application that combines traditional blog functionality with cutting-edge AI features including YouTube video transcription, text summarization, and AI image generation.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [AI Integration](#ai-integration)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Performance Optimizations](#performance-optimizations)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Ayan Blog is a modern content creation platform that leverages artificial intelligence to streamline the blog writing process. The application allows users to create blog posts through two distinct modes:

1. **Manual Creation**: Traditional blog post creation with rich text editing
2. **YouTube Transcription**: AI-powered transcription of YouTube videos with optional summarization

### Key Innovations

- **Multi-Modal Content Creation**: Seamlessly switch between manual and AI-assisted content creation
- **Real-time Transcription**: Convert YouTube videos to text using advanced speech recognition
- **Intelligent Summarization**: AI-powered text summarization with customizable length
- **AI Image Generation**: Generate cover images using Stable Diffusion
- **Drag-and-Drop Interface**: Intuitive image handling with drag-and-drop functionality

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login system
- JWT-based authentication with secure cookies
- Session management with cross-tab logout support
- Protected routes and API endpoints

### 📝 Content Creation
- **Manual Mode**:
  - Rich text editor with React Quill
  - Real-time preview
  - Image upload and management
  - Form validation with error handling

- **YouTube Transcription Mode**:
  - YouTube URL input and validation
  - Real-time video transcription using Vosk
  - AI-powered text improvement
  - Automatic title extraction
  - Side-by-side original and summarized text editing

### 🤖 AI-Powered Features
- **Text Summarization**:
  - Hugging Face BART model integration
  - Customizable summary length (20-1000 words)
  - Chunk-based processing for long texts
  - Real-time summarization with progress indicators

- **Image Generation**:
  - Stable Diffusion XL integration
  - Text-to-image generation
  - Drag-and-drop image integration
  - Base64 image handling for seamless integration

### 🎨 User Interface
- Responsive design with modern CSS
- Dark/light theme support
- Intuitive navigation
- Loading states and error handling
- Real-time feedback and validation

### 📊 Content Management
- Post listing with pagination
- Individual post viewing
- Author attribution
- Timestamp display
- Cover image support

## 🛠 Technology Stack

### Frontend
- **React 18.2.0**: Modern UI framework with hooks
- **React Router 6.22.3**: Client-side routing
- **React Quill 2.0.0**: Rich text editor
- **CSS3**: Custom styling with modern features
- **JavaScript ES6+**: Modern JavaScript features

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js 5.1.0**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose 8.15.1**: MongoDB object modeling
- **JWT**: JSON Web Token authentication
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### AI & ML Integration
- **Hugging Face Transformers**: Text summarization (BART)
- **Stable Diffusion XL**: Image generation
- **Vosk**: Speech recognition for transcription
- **PyTorch**: Deep learning framework
- **Transformers**: Natural language processing

### Development Tools
- **Git**: Version control
- **npm/yarn**: Package management
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🏗 Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   MongoDB       │    │   Hugging Face  │
│                 │    │   Database      │    │   API           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture (Frontend)
```
App
├── Layout
│   ├── Header
│   └── Outlet
├── HomePage
├── LoginPage
├── RegisterPage
├── CreatePost
│   ├── ImageGenerator
│   └── SummarizationSlider
└── PostPage
```

### API Architecture (Backend)
```
/api
├── index.js (Main server)
├── routes/
│   ├── summarize.js
│   └── generateImage.js
├── controllers/
│   ├── summarizeController.js
│   └── generateImageController.js
├── models/
│   ├── User.js
│   └── Post.js
├── utils/
│   ├── huggingface.js
│   └── huggingfaceImage.js
└── video_to_text/
    └── video_to_text.py
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.10+
- MongoDB (local or Atlas)
- Git

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd ayan-blog

# Install backend dependencies
cd api
npm install

# Create environment file
cp env.example .env
# Edit .env with your configuration

# Install Python dependencies
cd video_to_text
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the backend server
cd ..
npm start
```

### Frontend Setup
```bash
# Install frontend dependencies
cd client
npm install

# Create environment file
cp env.example .env.local
# Edit .env.local with your backend URL

# Start the frontend development server
npm start
```

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ayan-blog
JWT_SECRET=your-super-secret-jwt-key
HF_API_KEY=your-hugging-face-api-key
HF_IMAGE_API_KEY=your-hugging-face-image-api-key
FRONTEND_URL=http://localhost:3000
PORT=4000
```

#### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:4000
```

## 📖 Usage

### User Registration & Authentication
1. Navigate to the registration page
2. Create a new account with username and password
3. Login with your credentials
4. Access protected features like post creation

### Manual Post Creation
1. Click "Create new post" in the header
2. Select "Manual Creation" mode
3. Fill in title, summary, and content
4. Upload a cover image or generate one using AI
5. Submit the form to create your post

### YouTube Transcription
1. Select "YouTube Transcription" mode
2. Enter a YouTube URL
3. Click "Transcribe Video" to extract audio and convert to text
4. Optionally use the summarization feature
5. Edit the content as needed
6. Add title, summary, and cover image
7. Submit to create your post

### AI Features
- **Text Summarization**: Adjust the slider to control summary length
- **Image Generation**: Enter a description to generate cover images
- **Drag-and-Drop**: Drag generated images directly into your content

## 🔌 API Documentation

### Authentication Endpoints

#### POST /register
Register a new user
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST /login
Authenticate user
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST /logout
Logout user

#### GET /profile
Get current user profile

### Content Endpoints

#### POST /post
Create a new blog post
```json
{
  "title": "string",
  "summary": "string",
  "content": "string",
  "file": "image file"
}
```

#### GET /post
Get all posts (paginated)

#### GET /post/:id
Get specific post by ID

### AI Endpoints

#### POST /transcribe
Transcribe YouTube video
```json
{
  "url": "string",
  "improve": "boolean"
}
```

#### POST /summarize
Summarize text
```json
{
  "text": "string",
  "max_length": "number"
}
```

#### POST /generate-image
Generate AI image
```json
{
  "prompt": "string"
}
```

## 🤖 AI Integration Details

### Speech Recognition (Vosk)
- **Model**: Vosk small English model
- **Features**: Real-time transcription, word-level timestamps
- **Processing**: Audio conversion to WAV format, 16kHz mono
- **Accuracy**: High accuracy for clear speech

### Text Summarization (BART)
- **Model**: facebook/bart-large-cnn
- **Features**: Abstractive summarization, customizable length
- **Processing**: Chunk-based for long texts, parallel processing
- **Quality**: Maintains context and readability

### Image Generation (Stable Diffusion)
- **Model**: stabilityai/stable-diffusion-xl-base-1.0
- **Features**: Text-to-image generation, high resolution
- **Processing**: Base64 encoding for web integration
- **Quality**: Photorealistic and artistic outputs

## 🗄 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  summary: String (required),
  content: String (required),
  cover: String (file path),
  author: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure cookies
- Password hashing using bcrypt
- Protected routes and API endpoints
- Session management with automatic logout

### Data Validation
- Input sanitization and validation
- File upload restrictions (type, size)
- SQL injection prevention (MongoDB)
- XSS protection through proper encoding

### API Security
- CORS configuration for cross-origin requests
- Rate limiting (can be implemented)
- Request size limits
- Error handling without sensitive data exposure

## ⚡ Performance Optimizations

### Frontend Optimizations
- React.memo for component memoization
- Lazy loading for routes
- Image optimization and compression
- Efficient state management

### Backend Optimizations
- Database indexing on frequently queried fields
- Connection pooling for MongoDB
- File upload streaming
- Caching strategies (can be implemented)

### AI Processing Optimizations
- Chunk-based text processing
- Parallel API calls where possible
- Efficient image encoding/decoding
- Model caching and reuse

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Post creation (manual mode)
- [ ] YouTube transcription
- [ ] Text summarization
- [ ] Image generation
- [ ] File upload and drag-and-drop
- [ ] Responsive design
- [ ] Error handling
- [ ] Cross-browser compatibility

### Automated Testing (Future Implementation)
- Unit tests for components
- Integration tests for API endpoints
- End-to-end testing with Cypress
- Performance testing

## 🌐 Deployment

### Production Deployment
The application is designed for deployment on:
- **Frontend**: Vercel, Netlify, or similar
- **Backend**: Render, Heroku, or similar
- **Database**: MongoDB Atlas
- **AI Services**: Hugging Face Inference API

### Environment Configuration
- Environment variables for all sensitive data
- Production-specific configurations
- SSL/TLS encryption
- CDN integration for static assets

## 📈 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user editing
- **Advanced Analytics**: Post performance tracking
- **SEO Optimization**: Meta tags and sitemap generation
- **Social Media Integration**: Auto-posting to platforms
- **Multi-language Support**: Internationalization
- **Mobile App**: React Native version

### Technical Improvements
- **Microservices Architecture**: Service decomposition
- **GraphQL API**: More efficient data fetching
- **Real-time Updates**: WebSocket integration
- **Advanced Caching**: Redis implementation
- **CI/CD Pipeline**: Automated testing and deployment

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Document new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Project**: Ayan Blog
- **Version**: 1.0.0
- **Last Updated**: [Current Date]

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**🎉 Thank you for using Ayan Blog!** 