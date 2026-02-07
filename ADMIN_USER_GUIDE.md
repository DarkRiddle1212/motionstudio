# Motion Studio - Admin User Guide

**Version**: 1.0  
**Last Updated**: February 7, 2026

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Accessing the Admin Panel](#accessing-the-admin-panel)
3. [Managing Projects](#managing-projects)
4. [Uploading Media](#uploading-media)
5. [Managing Courses](#managing-courses)
6. [Managing Users](#managing-users)
7. [Analytics & Reports](#analytics--reports)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

Welcome to the Motion Studio Admin Panel! This guide will help you manage your portfolio projects, courses, users, and more.

### What You Can Do

As an admin, you can:
- ✅ Create and manage portfolio projects
- ✅ Upload images and videos for projects
- ✅ Create and manage courses
- ✅ Manage student enrollments
- ✅ Review student submissions
- ✅ View analytics and reports
- ✅ Manage user accounts

---

## Accessing the Admin Panel

### Login

1. Navigate to: `https://yourdomain.com/admin/login`
2. Enter your admin email and password
3. Click "Sign In"

### Admin Dashboard

After logging in, you'll see the admin dashboard with:
- Quick stats (total projects, courses, users)
- Recent activity
- Navigation menu

---

## Managing Projects

Projects are the portfolio pieces showcased on your website.

### Creating a New Project

1. Click **"Projects"** in the admin sidebar
2. Click the **"+ New Project"** button
3. Fill in the project details:
   - **Title**: Project name (e.g., "Nike Brand Animation")
   - **Description**: Brief overview of the project
   - **Goal**: What the client wanted to achieve
   - **Solution**: How you solved it
   - **Motion Breakdown**: Technical details of the animation
   - **Tools Used**: Software/tools used (comma-separated)

4. **Upload Media** (see [Uploading Media](#uploading-media) section)
5. Set **Order** (lower numbers appear first)
6. Toggle **Published** to make it visible on the website
7. Click **"Create Project"**

### Editing an Existing Project

1. Go to **Projects** page
2. Find the project you want to edit
3. Click the **"Edit"** button (pencil icon)
4. Make your changes
5. Click **"Update Project"**

### Deleting a Project

1. Go to **Projects** page
2. Find the project you want to delete
3. Click the **"Delete"** button (trash icon)
4. Confirm the deletion

⚠️ **Warning**: Deleting a project will also delete all associated media files (images, videos). This action cannot be undone.

---

## Uploading Media

Motion Studio supports both **images** and **videos** for your portfolio projects.

### Media Types

Each project can have:
- **Thumbnail**: Small preview image shown in the portfolio grid
- **Hero Media**: Large image or video shown at the top of the case study page
- **Gallery Images**: Multiple images shown in the case study gallery

### Uploading a Thumbnail

1. In the project form, find the **"Thumbnail"** section
2. You have two options:

   **Option A: Drag & Drop**
   - Drag an image file from your computer
   - Drop it onto the upload zone
   
   **Option B: Click to Browse**
   - Click the upload zone
   - Select an image file from your computer

3. **Wait for upload** - You'll see a progress bar
4. **Preview** - Once uploaded, you'll see a preview with:
   - Image dimensions
   - File size
   - Replace/Remove buttons

**Thumbnail Requirements**:
- ✅ File types: JPG, PNG, WebP, GIF
- ✅ Max size: 5MB
- ✅ Recommended dimensions: 800x600px or similar aspect ratio

### Uploading Hero Media (Image or Video)

1. In the project form, find the **"Hero Media"** section
2. **Choose Media Type**:
   - Click **"Image"** for a static image
   - Click **"Video"** for a video file

#### For Images:
3. Upload using drag & drop or click to browse
4. Wait for processing and preview

**Hero Image Requirements**:
- ✅ File types: JPG, PNG, WebP, GIF
- ✅ Max size: 10MB
- ✅ Recommended dimensions: 1920x1080px (Full HD)

#### For Videos:
3. Upload using drag & drop or click to browse
4. Wait for processing (this may take longer for large videos)
5. A thumbnail will be automatically generated
6. Preview the video with custom controls

**Hero Video Requirements**:
- ✅ File types: MP4, WebM, MOV
- ✅ Max size: 50MB
- ✅ Recommended: 1920x1080px (Full HD), H.264 codec
- ✅ Duration: Keep under 30 seconds for best performance

**Video Processing**:
- Videos are automatically optimized for web playback
- A thumbnail is generated at the 1-second mark
- The video is converted to MP4 with H.264 codec
- Faststart flag is added for instant playback

### Uploading Gallery Images

1. In the project form, find the **"Gallery Images"** section
2. **Upload Multiple Images**:
   - Drag multiple image files at once, OR
   - Click to browse and select multiple files

3. **Manage Gallery**:
   - **Reorder**: Drag images to change their order
   - **Delete**: Click the X button on any image
   - **Add More**: Click "Add More Images" to upload additional images

**Gallery Requirements**:
- ✅ File types: JPG, PNG, WebP, GIF
- ✅ Max size per image: 5MB
- ✅ Maximum images: 10 per project
- ✅ Recommended dimensions: 1200x900px or similar

### Upload Tips

✅ **Best Practices**:
- Use high-quality images (but not too large)
- Keep videos under 30 seconds
- Use consistent aspect ratios across projects
- Compress images before uploading for faster uploads
- Test videos play correctly after upload

⚠️ **Common Issues**:
- **"File too large"**: Reduce file size or compress the image/video
- **"Invalid file type"**: Make sure you're using supported formats
- **"Upload failed"**: Check your internet connection and try again

### Replacing Media

To replace existing media:
1. Click the **"Replace"** button on the preview
2. Upload a new file
3. The old file will be automatically deleted

### Removing Media

To remove media without replacing:
1. Click the **"Remove"** button on the preview
2. Confirm the deletion
3. The file will be deleted from the server

---

## Managing Courses

### Creating a Course

1. Click **"Courses"** in the admin sidebar
2. Click **"+ New Course"**
3. Fill in course details:
   - Title, description, price
   - Difficulty level
   - Duration
4. Click **"Create Course"**

### Adding Lessons

1. Open a course
2. Click **"+ Add Lesson"**
3. Fill in lesson details:
   - Title, content
   - Video URL (Vimeo/YouTube)
   - Order
4. Click **"Save Lesson"**

### Adding Assignments

1. Open a course
2. Click **"+ Add Assignment"**
3. Fill in assignment details:
   - Title, description
   - Submission type (file/link)
   - Deadline
4. Click **"Create Assignment"**

---

## Managing Users

### Viewing Users

1. Click **"Users"** in the admin sidebar
2. View list of all users with:
   - Name, email, role
   - Registration date
   - Account status

### Creating a User

1. Click **"+ New User"**
2. Fill in user details:
   - Email, password
   - First name, last name
   - Role (Student/Instructor/Admin)
3. Click **"Create User"**

### Editing User Roles

1. Find the user in the list
2. Click **"Edit"**
3. Change the role
4. Click **"Update User"**

### Managing Enrollments

1. Go to **"Courses"**
2. Click on a course
3. View **"Enrolled Students"** tab
4. Add/remove students as needed

---

## Analytics & Reports

### Financial Dashboard

1. Click **"Finance"** in the admin sidebar
2. View:
   - Total revenue
   - Revenue by course
   - Payment history
   - Pending payments

### Analytics Dashboard

1. Click **"Analytics"** in the admin sidebar
2. View:
   - User growth
   - Course enrollments
   - Completion rates
   - Popular courses

### Exporting Reports

1. Go to the relevant dashboard
2. Click **"Export"** button
3. Choose format (CSV/PDF)
4. Download the report

---

## Troubleshooting

### Upload Issues

**Problem**: "Upload failed" error

**Solutions**:
1. Check your internet connection
2. Verify file size is within limits
3. Ensure file type is supported
4. Try a different browser
5. Clear browser cache and try again

**Problem**: Video won't play after upload

**Solutions**:
1. Verify the video format is supported (MP4, WebM, MOV)
2. Check if the video is corrupted
3. Try re-uploading the video
4. Convert video to MP4 with H.264 codec before uploading

**Problem**: Image quality looks poor

**Solutions**:
1. Upload higher resolution images
2. Avoid uploading already compressed images
3. Use PNG for graphics with text
4. Use JPG for photographs

### Performance Issues

**Problem**: Admin panel is slow

**Solutions**:
1. Clear browser cache
2. Close unnecessary browser tabs
3. Check internet connection speed
4. Try a different browser

**Problem**: Large file uploads timeout

**Solutions**:
1. Compress files before uploading
2. Use a stable internet connection
3. Upload during off-peak hours
4. Split large galleries into multiple uploads

### Access Issues

**Problem**: Can't log in to admin panel

**Solutions**:
1. Verify you're using the correct email and password
2. Check if your account has admin privileges
3. Try resetting your password
4. Contact the system administrator

**Problem**: "Unauthorized" error when uploading

**Solutions**:
1. Log out and log back in
2. Check if your session expired
3. Verify you have admin privileges
4. Clear browser cookies and try again

---

## Best Practices

### Project Management

✅ **Do**:
- Use descriptive project titles
- Write clear, concise descriptions
- Upload high-quality media
- Keep videos short and engaging
- Organize projects with meaningful order numbers
- Publish projects only when complete

❌ **Don't**:
- Upload copyrighted content without permission
- Use extremely large files (compress first)
- Leave projects unpublished indefinitely
- Delete projects with active references

### Media Management

✅ **Do**:
- Optimize images before uploading
- Use consistent aspect ratios
- Test videos before uploading
- Keep file sizes reasonable
- Use descriptive filenames
- Preview media after upload

❌ **Don't**:
- Upload raw, uncompressed files
- Use inconsistent image sizes
- Upload videos longer than 2 minutes
- Forget to test on mobile devices
- Use special characters in filenames

### Security

✅ **Do**:
- Use strong passwords
- Log out when finished
- Keep your credentials secure
- Regularly review user access
- Monitor upload activity

❌ **Don't**:
- Share admin credentials
- Leave sessions open on shared computers
- Grant admin access unnecessarily
- Ignore security warnings

---

## Keyboard Shortcuts

Speed up your workflow with these shortcuts:

- **Ctrl/Cmd + S**: Save current form
- **Ctrl/Cmd + N**: Create new item (when on list page)
- **Esc**: Close modal/dialog
- **Arrow Keys**: Navigate through lists
- **Enter**: Confirm action

---

## Getting Help

### Support Resources

- **Documentation**: Check this guide first
- **API Documentation**: `backend/API_DOCUMENTATION.md`
- **Technical Docs**: `backend/FILE_STORAGE_DOCUMENTATION.md`
- **Troubleshooting**: See [Troubleshooting](#troubleshooting) section above

### Contact Support

If you need additional help:
1. Check the troubleshooting section
2. Review error messages carefully
3. Try the suggested solutions
4. Contact your system administrator with:
   - Description of the issue
   - Steps to reproduce
   - Screenshots (if applicable)
   - Browser and OS information

---

## Appendix

### Supported File Formats

**Images**:
- JPEG/JPG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

**Videos**:
- MP4 (.mp4)
- WebM (.webm)
- QuickTime (.mov)

### File Size Limits

- **Thumbnail Images**: 5MB
- **Hero Images**: 10MB
- **Hero Videos**: 50MB
- **Gallery Images**: 5MB per image

### Recommended Dimensions

- **Thumbnail**: 800x600px (4:3 ratio)
- **Hero Image**: 1920x1080px (16:9 ratio)
- **Hero Video**: 1920x1080px (Full HD)
- **Gallery Images**: 1200x900px (4:3 ratio)

### Browser Compatibility

The admin panel works best on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

**Need more help?** Contact your system administrator or refer to the technical documentation.

**Happy creating!** 🎨✨
