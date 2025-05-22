# eGarant API

**eGarant API**, the backend service powering the [eGarant Mobile App](https://github.com/A-Cdeveloper/eGarant-MobileApp---frontend). This API is responsible for managing user accounts, invoices, sellers, and warranty-covered products. It is built with **Next.js 15**, **Prisma ORM**, and **MySQL**, and uses **JWT** for authentication and **Zod** for validation.

## 🚀 Features

- ✅ User registration with OTP email confirmation
- ✅ JWT-based authentication (login/logout)
- ✅ User profile management (view/delete)
- ✅ Invoice and product management
- ✅ Automatic cascade deletion of invoices and products when a user is deleted
- ✅ Email integration (OTP)
- ✅ Server Actions with direct Prisma access

## 🛠 Tech Stack

- **Backend Framework**: Next.js 15)
- **Database**: MySQL (via Prisma ORM)
- **Auth**: JSON Web Tokens (`jose`)
- **Validation**: Zod
- **Email**: SMTP (via Nodemailer)

---

## 📦 Installation

1.  **Clone the repository**:

```
git clone https://github.com/A-Cdeveloper/eGarant-MobileApp---API.git
cd eGarant-MobileApp---API
```

1.  **Install dependencies**:

```
npm install
```

1.  **Set up environment variables**:

Create a `.env` file and configure the following:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret"
EMAIL_USER="your@email.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="eGarant <your@email.com>"
```

1.  **Push Prisma schema & generate client**:

```
npx prisma db push
npx prisma generate
```

1.  **Run the development server**:

```
npm run dev
```

---

## 📬 API Documentation

View the full Postman collection here:

🔗 [https://documenter.getpostman.com/view/35019147/2sB2qaiggi](https://documenter.getpostman.com/view/35019147/2sB2qaiggi)

### 🧾 Example Endpoints

#### 1\. **Send OTP**

```
POST /api/auth/send-otp
```

Body:

```
{
  "email": "example@example.com"
}
```

#### 2\. **Verify OTP (Login or Register)**

```
POST /api/auth/verify-otp
```

Body:

```
{
  "email": "example@example.com",
  "otp": "123456"
}
```

Returns a JWT token.

#### 3\. **Delete User Profile**

```
DELETE /api/user/delete/:uid
```

Authorization: Bearer Token

Automatically deletes user, invoices, and related products.

---

## 🔐 Authentication

All protected routes require a `Bearer Token` (JWT) in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

---

## 📂 Project Structure

```
/app
  └── api/
        └── auth/       - OTP + login
        └── user/       - User profile actions
/lib
  └── db.ts             - Prisma client
  └── auth/             - JWT utilities
/prisma
  └── schema.prisma     - Database schema
```

---

## 🧪 Testing

To test locally, you can use the [Postman collection](https://documenter.getpostman.com/view/35019147/2sB2qaiggi) or `curl`.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more info.

---

## 🙌 Contributing

If you have suggestions or find a bug, feel free to open an issue or PR.

---

Made with ❤️ by [@A-Cdeveloper](https://github.com/A-Cdeveloper)
