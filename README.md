# Portfolio

Welcome to my portfolio! This project showcases my skills, experience, and projects. Explore the sections to learn more about my work, technologies I use, and how to contact me.

- **Projects:** Highlights of my best work.
- **Skills:** Technologies and tools I am proficient in.
- **Contact:** How to reach me for collaboration or inquiries.

Feel free to browse and connect!

## Running locally (Node.js server)

1. Install dependencies:

```powershell
cd c:\Users\hp\Downloads\portifo
npm install
```

2. Create `.env` from `.env.example` (if you want email notifications):

```powershell
copy .env.example .env
# edit .env and set EMAIL_USER and EMAIL_PASS
```

3. Start the server:

```powershell
npm run start
# or for development with auto-reload:
npm run dev
```

4. Open http://localhost:3000 in your browser.

### Notes

- The contact form sends POST /api/contact (handled by `server.js`).
- If email isn't configured the server still accepts messages and stores them in memory.
- For production, replace in-memory storage with a database and secure your email credentials.
