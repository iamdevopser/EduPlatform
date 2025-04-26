# EduPlatform

An educational platform with payment processing and invoice generation capabilities.

## Project Structure

- `src/EduPlatform.API`: Backend API built with .NET 7
- `src/EduPlatform.Web`: Frontend web application built with React and TypeScript

## Features

- Payment processing with Stripe integration
- Invoice generation and management
- User authentication and authorization
- Course management
- Student enrollment

## Getting Started

### Prerequisites

- .NET 7 SDK
- Node.js 16+
- PostgreSQL
- Stripe account

### Configuration

1. Clone the repository
2. Set up environment variables:
   - Create `appsettings.json` in the API project
   - Create `.env` file in the Web project
3. Update database connection string
4. Configure Stripe API keys

### Running the Application

1. Start the API:
```bash
cd src/EduPlatform.API
dotnet run
```

2. Start the Web application:
```bash
cd src/EduPlatform.Web
npm install
npm start
```

## API Documentation

The API documentation is available at `/swagger` when running the application.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 