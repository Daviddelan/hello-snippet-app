# HelloSnippet - Event Management Platform

A modern, full-featured event management platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🎯 Core Functionality
- **Event Creation & Management**: Create, edit, and manage events with rich details
- **Image Upload & Processing**: Secure image upload with automatic cropping and validation
- **Location Integration**: Google Maps integration for precise location selection
- **User Authentication**: Secure authentication with Supabase Auth
- **Real-time Analytics**: Track event performance and attendee engagement
- **Responsive Design**: Beautiful, mobile-first design that works on all devices

### 🔒 Security & Validation
- **Server-side Validation**: Comprehensive validation for all user inputs
- **Image Security**: File type, size, and dimension validation for uploaded images
- **Location Validation**: Coordinate and address validation for event locations
- **XSS Protection**: Input sanitization to prevent cross-site scripting
- **SQL Injection Protection**: Parameterized queries through Supabase

### 🖼️ Image Management
- **Supabase Storage**: Secure cloud storage for event images
- **Image Cropping**: Built-in cropping tool with 16:9 aspect ratio for slideshow compatibility
- **Format Support**: JPG, PNG, GIF, and WebP formats
- **Size Validation**: Maximum 10MB file size with dimension requirements
- **Automatic Optimization**: Images are processed and optimized for web delivery

### 🗺️ Location Features
- **Google Maps Integration**: Interactive map for location selection
- **Address Autocomplete**: Smart address suggestions and validation
- **Coordinate Validation**: Precise latitude/longitude validation
- **Geocoding**: Automatic address-to-coordinate conversion

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Maps**: Google Maps JavaScript API
- **Image Processing**: React Image Crop
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** - [Sign up here](https://supabase.com)
3. **Google Cloud Account** - For Maps API [Get started here](https://console.cloud.google.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hellosnippet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

### Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migrations** in your Supabase SQL Editor:
   
   First, run the organizers table migration:
   ```sql
   -- Copy and paste the contents of supabase/migrations/20250616090710_lively_bread.sql
   ```
   
   Then, run the events table migration:
   ```sql
   -- Copy and paste the contents of supabase/migrations/20250616155714_weathered_bar.sql
   ```

3. **Set up Storage** (for image uploads):
   - Go to Storage in your Supabase dashboard
   - The app will automatically create the `event-images` bucket
   - Ensure storage is enabled in your project

### Google Maps Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Required APIs**
   - Maps JavaScript API
   - Places API
   - Geocoding API

3. **Create API Key**
   - Go to Credentials → Create Credentials → API Key
   - Restrict the key to your domains and selected APIs
   - Add the key to your `.env` file

4. **Set up Billing** (Required for Google Maps)
   - Google provides $200 free credit monthly
   - Set usage quotas to prevent unexpected charges

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:5173`

3. **Check the Database Status** - The app will show a status indicator in the top-right corner indicating if all systems are properly configured.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   │   ├── CreateEventModal.tsx
│   │   ├── ImageCropper.tsx
│   │   ├── LocationPicker.tsx
│   │   └── ...
│   └── ...
├── pages/               # Page components
├── services/            # Business logic and API calls
│   ├── eventService.ts
│   ├── organizerService.ts
│   ├── storageService.ts
│   └── validationService.ts
├── lib/                 # Configuration and utilities
├── utils/               # Helper functions
└── ...
```

## Key Features Explained

### Image Upload & Cropping

The platform includes a sophisticated image management system:

1. **Upload Validation**: Files are validated for type, size, and dimensions
2. **Interactive Cropping**: Users can crop images to the perfect 16:9 aspect ratio
3. **Secure Storage**: Images are uploaded to Supabase Storage with proper access controls
4. **Automatic Processing**: Images are optimized and processed server-side

### Location Selection

Location selection is powered by Google Maps:

1. **Interactive Map**: Users can click anywhere on the map to select a location
2. **Address Search**: Smart autocomplete for address searching
3. **Coordinate Validation**: Ensures valid latitude/longitude coordinates
4. **Geocoding**: Automatic conversion between addresses and coordinates

### Server-side Validation

All user inputs are validated both client-side and server-side:

1. **Event Data**: Title, description, dates, capacity, and pricing validation
2. **Location Data**: Address and coordinate validation
3. **Image Data**: File type, size, and dimension validation
4. **Security**: XSS prevention and input sanitization

## Security Considerations

- **Input Sanitization**: All text inputs are sanitized to prevent XSS attacks
- **File Validation**: Uploaded files are thoroughly validated before processing
- **Access Control**: Row Level Security (RLS) ensures users can only access their own data
- **API Security**: All API calls are authenticated and authorized through Supabase

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your repository to your deployment platform
2. Set environment variables in the deployment dashboard
3. Deploy the `dist` folder

### Environment Variables for Production

Make sure to set these in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.