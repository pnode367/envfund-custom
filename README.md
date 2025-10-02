# envfund-custom

MERN Grant Management Platform for Environmental Sustainability - Multi-role application with bilingual support.

## 🚀 Project Versions

This repository contains two frontend implementations:

### 1. Next.js Frontend (Recommended) ✨
**Location:** `/nextjs-frontend/`

Modern Next.js 15 implementation with App Router, Turbopack, and SSR capabilities.

**Tech Stack:**
- Next.js 15.5.4
- React 19.1.0
- Tailwind CSS 4
- Turbopack

**Quick Start:**
```bash
cd nextjs-frontend
npm install
npm run dev
```

Visit: http://localhost:3000

### 2. React (CRA) Frontend (Legacy)
**Location:** `/frontend/`

Original Create React App implementation preserved for reference.

**Quick Start:**
```bash
cd frontend
npm install
npm start
```

Visit: http://localhost:3000

## 📖 Documentation

- **[Migration Guide](MIGRATION.md)** - Complete guide on the React to Next.js migration
- **[Next.js README](nextjs-frontend/README.md)** - Detailed Next.js setup and usage

## 🎯 Features

### Multi-Role Support
- **Applicant**: Submit and manage grant applications
- **Reviewer**: Evaluate applications with scoring system
- **Editor**: Manage document templates and communications
- **Admin**: Full system administration and user management

### Bilingual Interface
- **English**: Full interface translation
- **Arabic**: Complete RTL (Right-to-Left) support

### Core Capabilities
- Grant application workflow
- Document management (Data Room)
- Financial tracking and milestones
- Evaluation and review system
- Real-time notifications (ready)
- Chat functionality (ready)
- Reports and analytics
- Integration management

## 🔐 Development Credentials

Default test accounts:

| Role | Email | Password |
|------|-------|----------|
| Applicant | applicant@ksu.edu.sa | password123 |
| Reviewer | reviewer@ksu.edu.sa | password123 |
| Editor | editor@ksu.edu.sa | password123 |
| Admin | admin@ksu.edu.sa | password123 |

## 🛠️ Tech Stack Overview

### Frontend (Next.js)
- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- lucide-react icons
- Client-side state management (localStorage)

### Planned Backend
- Node.js 20 + Express
- MongoDB Atlas
- JWT authentication
- Socket.IO for realtime
- Multer + S3/R2 for file storage

## 📦 Project Structure

```
envfund-custom/
├── nextjs-frontend/        # Next.js implementation (CURRENT)
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   └── public/           # Static assets
├── frontend/              # React CRA (LEGACY)
│   └── src/              # Source files
├── MIGRATION.md          # Migration documentation
└── README.md            # This file
```

## 🚧 Current Status

### ✅ Completed
- [x] Next.js migration from CRA
- [x] All UI components migrated
- [x] Bilingual support (EN/AR)
- [x] Role-based dashboards
- [x] Mock data integration
- [x] Responsive design
- [x] Production build optimized

### 🔄 In Progress / Planned
- [ ] Backend API implementation
- [ ] Redux Toolkit + RTK Query integration
- [ ] Real authentication with JWT
- [ ] Socket.IO integration
- [ ] File upload to S3/R2
- [ ] Database integration (MongoDB)
- [ ] API route implementation
- [ ] Testing suite (Vitest/Jest)

## 🌐 Deployment

### Vercel (Recommended for Frontend)
```bash
cd nextjs-frontend
vercel deploy
```

### Manual Deployment
```bash
cd nextjs-frontend
npm run build
npm start
```

## 📝 Development Workflow

1. **Start Development Server**
   ```bash
   cd nextjs-frontend
   npm run dev
   ```

2. **Make Changes**
   - Components in `components/`
   - Utilities in `lib/utils/`
   - Styles in Tailwind classes

3. **Test**
   - Test in English and Arabic
   - Test all 4 user roles
   - Test responsive design

4. **Build**
   ```bash
   npm run build
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both languages, all roles)
5. Submit a pull request

## 📄 License

[Your License Here]

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Migration Guide](MIGRATION.md)

---

**Status:** Active Development  
**Version:** 1.0.0-beta  
**Last Updated:** October 2024