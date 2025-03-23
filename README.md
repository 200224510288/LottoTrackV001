Project Description

Lotto-Track Website :

A modern, role-based admin dashboard built with Next.js, Prisma, PostgreSQL, and Tailwind CSS. This application features user authentication with Clerk, 2-step verification, form validation with Zod and React Hook Form, and image uploads using Cloudinary. Hosted on a Hostinger Ubuntu VPS at http://osmanandsons.com:3000/.

Tech Stack
Frontend: Next.js, Tailwind CSS

Backend: Next.js API Routes

Database: PostgreSQL (managed with Prisma ORM)

Authentication: Clerk (with 2-step verification)

Form Management: React Hook Form + Zod validation

Image Uploads: Cloudinary

Hosting: Hostinger Ubuntu VPS

Features
User Authentication:

Sign-up, login, and 2-step verification powered by Clerk.

Role-based access control (admin, office_staff, district_agent).

Form Management:

Efficient form handling with React Hook Form.

Robust validation using Zod.

Image Uploads:

Seamless image uploads and management with Cloudinary.

Database:

PostgreSQL database managed with Prisma ORM for type-safe queries and migrations.

Styling:

Responsive and modern UI built with Tailwind CSS.

Hosting:

Deployed on a Hostinger Ubuntu VPS and accessible at http://osmanandsons.com:3000/.

1. Setup Instructions
git clone https://github.com/your-username/osman-and-sons.git
npm install


3. Set Up Environment Variables
Create a .env file in the root directory and add the following variables:

DATABASE_URL="postgresql://user:password@localhost:5432/osman-and-sons"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

4. Run Database Migrations

npx prisma migrate dev --name init

npm run dev

Visit http://localhost:3000 to view the application.

API Endpoints
Authentication: Handled by Clerk.

Image Upload: POST /api/upload (uses Cloudinary).

User Management: GET /api/users (role-based access).

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature-name).

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature/your-feature-name).

Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Live Demo
Check out the live demo at: http://osmanandsons.com:3000/


