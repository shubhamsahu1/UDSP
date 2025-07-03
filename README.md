# Initial Dashboard - Full Stack Application

A modern full-stack web application built with React frontend and Node.js backend, featuring Material-UI components, internationalization, and MongoDB database.

## Features

### Frontend (React)
- **Material-UI Components**: Modern, responsive UI components
- **Theme Provider**: Customizable MUI theme with consistent styling
- **Internationalization**: Multi-language support (English & Spanish)
- **Axios Integration**: HTTP client for API calls with interceptors
- **Authentication**: JWT-based login system with protected routes
- **Responsive Design**: Mobile-first approach with responsive navigation
- **Dashboard**: Overview with statistics and recent activity
- **User Management**: Profile management and password change functionality

### Backend (Node.js)
- **Express.js**: Fast, unopinionated web framework
- **Security Middleware**: Helmet, CORS, rate limiting
- **MongoDB Integration**: Cloud MongoDB with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Environment Configuration**: Environment variables for configuration
- **API Routes**: RESTful API endpoints with proper error handling

## Project Structure

```
application-init/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # Reusable components
│   │   │   └── Layout/     # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.js          # Main app component
│   │   ├── index.js        # Entry point
│   │   ├── theme.js        # MUI theme configuration
│   │   └── i18n.js         # Internationalization setup
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Custom middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── package.json            # Root package.json
├── env.example             # Environment variables template
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for cloud database)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd application-init
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   
   Update the `.env` file with your MongoDB connection string and other settings:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/application_init?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=24h
   
   # Frontend Configuration
   REACT_APP_API_URL=http://localhost:4000/api
   REACT_APP_NAME=Initial Dashboard
   ```

## Running the Application

### Development Mode

1. **Start both frontend and backend**
   ```bash
   npm run dev
   ```

2. **Or start them separately**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Application health status

### Authentication
- `POST /api/auth/register` - Register new user (admin only, with validation)
- `POST /api/auth/login` - User login (with validation)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password (with validation)

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile (with validation)
- `GET /api/user/all` - Get all users (admin only)
- `POST /api/user/create` - Create new user (admin only, with validation)
- `PUT /api/user/:id` - Update user (admin only, with validation)
- `PUT /api/user/:id/password` - Change user password (admin only, with validation)
- `PUT /api/user/:id/status` - Toggle user status (admin only)
- `DELETE /api/user/:id` - Delete user (admin only)

All endpoints include comprehensive input validation and security checks.

## Creating Admin User

Create a secure admin user using the provided script:

```bash
npm run create-admin
```

This will generate a secure random password that meets the following requirements:
- At least 12 characters long
- Contains uppercase and lowercase letters
- Contains numbers and symbols
- Password is securely generated and displayed once

**Important:** Save the generated password securely as it won't be shown again!

## Features in Detail

### Frontend Features
- **Responsive Navigation**: Collapsible sidebar for mobile devices
- **User Menu**: Profile information, role display, and logout functionality
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Loading indicators for better UX
- **Error Handling**: Comprehensive error handling and user feedback

### Backend Features
- **Enhanced Security**: Helmet for security headers, production-ready CORS configuration
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive server-side validation with express-validator
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Environment Validation**: Startup validation of required environment variables
- **Password Security**: Strong password requirements and secure admin generation
- **Health Monitoring**: Built-in health check endpoint
- **Database**: MongoDB with Mongoose for data modeling

## Technologies Used

### Frontend
- React 18
- Material-UI (MUI) 5
- React Router DOM 6
- Axios
- React i18next
- Emotion (for MUI styling)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- Helmet
- CORS
- express-rate-limit

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
