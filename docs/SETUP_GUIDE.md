# 🚀 Uplern Setup Guide

## **Prerequisites**
- Node.js 18+ installed
- Supabase account (free tier works)
- Git (optional)

## **Step 1: Database Setup**

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: `uplern-careers`
5. Enter a strong database password
6. Select a region close to you
7. Click "Create new project"
8. Wait 2-3 minutes for setup to complete

### 1.2 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with https://xxx.supabase.co)
   - **anon/public key** (starts with eyJ...)
   - **service_role key** (starts with eyJ...)

### 1.3 Update Environment File
Your `.env.local` file should look like this:
```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Credentials
ADMIN_EMAIL=admin@system.com
ADMIN_PASSWORD=admin123
```

## **Step 2: Create Database Schema**

### 2.1 Run Schema Script
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content from `supabase/schema.sql`
4. Paste it in the SQL editor
5. Click **Run** (play button)
6. Wait for "Success. No rows returned" message

### 2.2 Initialize Default Data
1. Create another new query in SQL Editor
2. Copy the entire content from `scripts/init-database.sql`
3. Paste it in the SQL editor
4. Click **Run**
5. You should see a table showing counts:
   - Roles: 3
   - Tenures: 3
   - Templates: 7
   - Admins: 1

### 2.3 Verify Tables
Go to **Table Editor** and check these tables exist:
- ✅ `admins` (1 row)
- ✅ `roles` (3 rows)
- ✅ `tenures` (3 rows)
- ✅ `templates` (7 rows)
- ✅ `users` (empty initially)
- ✅ `offer_letters` (empty initially)

## **Step 3: Set Up File Storage**

### 3.1 Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click "Create a new bucket"
3. Name: `applications`
4. Make it **Public**
5. Set file size limit: `5MB`
6. Allowed MIME types: `image/jpeg,image/png,application/pdf`
7. Click "Create bucket"

### 3.2 Set Storage Policies
1. Go to **Storage** → **Policies**
2. For the `applications` bucket, add these policies:
   - **SELECT**: Allow public read access
   - **INSERT**: Allow public upload
   - **DELETE**: Allow authenticated delete

## **Step 4: Install Dependencies & Test**

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Test Database Connection
```bash
npm run setup-db
```

You should see:
```
🚀 Setting up Uplern database...
✅ Database connection successful
✅ Storage bucket created/exists
✅ Database data looks good
✅ File upload permissions working
🎉 Database setup complete!
```

### 4.3 Start Development Server
```bash
npm run dev
```

## **Step 5: Test Your Application**

### 5.1 Test Public Site
1. Visit: `http://localhost:3000`
2. Click "Apply for Positions"
3. Fill out the form with test data
4. Upload sample files (JPG, PNG, or PDF under 5MB)
5. Submit the application

### 5.2 Test Admin Panel
1. Visit: `http://localhost:3000/admin`
2. Login with:
   - **Email**: `admin@system.com`
   - **Password**: `admin123`
3. Test all admin features:
   - View dashboard statistics
   - Check "Database Test" tab
   - Review applications in "Applications" tab
   - Manage templates in "Templates" tab
   - Configure roles in "Roles & Tenures" tab

## **🎯 Troubleshooting**

### Database Connection Issues
- ✅ Check your `.env.local` file has correct Supabase credentials
- ✅ Ensure Supabase project is active (not paused)
- ✅ Verify you ran both SQL scripts in correct order
- ✅ Check your internet connection

### File Upload Issues
- ✅ Ensure storage bucket `applications` exists
- ✅ Check bucket is set to public
- ✅ Verify storage policies allow public insert/select
- ✅ Test with files under 5MB in JPG/PNG/PDF format

### Authentication Issues
- ✅ Clear browser localStorage and try again
- ✅ Check admin credentials in `.env.local`
- ✅ Verify admin record exists in database

### Build/Runtime Errors
- ✅ Run `npm run type-check` to check TypeScript errors
- ✅ Check browser console for JavaScript errors
- ✅ Ensure all dependencies are installed

## **🚀 Production Deployment**

### Environment Variables
Set these in your hosting platform:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_secure_password
```

### Build Commands
```bash
npm run build
npm start
```

## **✅ Success Checklist**

- [ ] Supabase project created and configured
- [ ] Database schema and data initialized
- [ ] Storage bucket created with proper policies
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database connection test passes
- [ ] Public application form works
- [ ] File uploads work
- [ ] Admin panel accessible
- [ ] All admin features functional

## **🆘 Need Help?**

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set
4. Ensure you followed each step exactly
5. Try the database test in admin panel

**Your Uplern career platform is now ready! 🎉**
