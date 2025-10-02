# MERN Grant Platform - Next.js Frontend

This is the Next.js-based frontend for the MERN Grant Platform, migrated from Create React App. The platform supports multiple user roles (Applicant, Reviewer, Editor, Admin) with bilingual support (English/Arabic) and RTL layout.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Build Tool**: Turbopack (Next.js native)
- **Language**: JavaScript (ES6+)

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

## 🛠️ Getting Started

### Installation

```bash
cd nextjs-frontend
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🔐 Default Credentials

**Applicant:** applicant@ksu.edu.sa / password123  
**Reviewer:** reviewer@ksu.edu.sa / password123  
**Editor:** editor@ksu.edu.sa / password123  
**Admin:** admin@ksu.edu.sa / password123

## 🎨 Key Features

- Multi-role support (Applicant, Reviewer, Editor, Admin)
- Bilingual support (English/Arabic with RTL)
- Responsive design with mobile drawer
- Local storage state persistence
- Mock data for development

## 📁 Project Structure

```
nextjs-frontend/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/utils/          # Utilities and constants
└── public/assets/      # Static assets
```

## 🔄 Migration Notes

Migrated from Create React App to Next.js 15:
- Added 'use client' directive for stateful components
- Changed asset imports to public path references
- Updated import paths to use @/ alias
- Added SSR safety checks (typeof window)

---

**Built with Next.js 15 & Tailwind CSS 4** 🚀
