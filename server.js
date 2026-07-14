try { require("dotenv").config(); } catch (_) {}
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, process.env.PUBLIC_DIR || ".");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DATA_DIR = path.join(ROOT, "data");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- JSON File Database ---------- */
const DB = {
  reviews: path.join(DATA_DIR, "reviews.json"),
  reservations: path.join(DATA_DIR, "reservations.json"),
  contact: path.join(DATA_DIR, "contact.json"),
  gallery: path.join(DATA_DIR, "gallery.json"),
};

function readDB(key) {
  try {
    if (!fs.existsSync(DB[key])) return [];
    const data = fs.readFileSync(DB[key], "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeDB(key, data) {
  fs.writeFileSync(DB[key], JSON.stringify(data, null, 2), "utf8");
}

/* ---------- Middleware ---------- */
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));
app.use("/uploads", express.static(UPLOAD_DIR));

/* ---------- Rate Limiting ---------- */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many messages. Please try again later." },
});
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many submissions. Please try again later." },
});
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many uploads. Please try again later." },
});

/* ---------- Spam Protection (Honeypot) ---------- */
function honeypot(req, res, next) {
  if (req.body && req.body.website) {
    return res.status(400).json({ ok: false, message: "Spam detected." });
  }
  next();
}

/* ---------- File Upload ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = (req.body.category || "general").replace(/[^a-zA-Z0-9-_]/g, "");
    const uploadPath = path.join(UPLOAD_DIR, category);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|webp|gif)$/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type. Only JPEG, PNG, WebP, and GIF allowed."));
  },
});

/* ---------- Email Setup ---------- */
function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return null;
}
const EMAIL_TO = process.env.CONTACT_EMAIL || "tsgeredahotel@example.com";
const EMAIL_FROM = process.env.MAIL_FROM || EMAIL_TO;

async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log("[email] Not configured. Would send:", { to, subject });
    return { simulated: true };
  }
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: to || EMAIL_TO,
    subject: subject || "tsgereda Hotel Notification",
    text: text || "",
    html: html || "",
  });
  return { sent: true };
}

/* ---------- Health Check ---------- */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "tsgereda-hotel",
    time: new Date().toISOString(),
    emailConfigured: Boolean(process.env.SMTP_HOST),
    database: "json-files",
  });
});

/* ---------- Contact Form ---------- */
app.post("/api/contact", contactLimiter, honeypot, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ ok: false, message: "All fields are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email address." });
    }
    if (message.length > 5000) {
      return res.status(400).json({ ok: false, message: "Message too long." });
    }

    const contacts = readDB("contact");
    const newContact = {
      id: Date.now(),
      name,
      email,
      subject,
      message,
      status: "new",
      created_at: new Date().toISOString(),
    };
    contacts.push(newContact);
    writeDB("contact", contacts);

    await sendEmail({
      to: EMAIL_TO,
      subject: `tsgereda Hotel Contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `<h2>New Contact Message</h2>
             <p><strong>Name:</strong> ${escapeHtml(name)}</p>
             <p><strong>Email:</strong> ${escapeHtml(email)}</p>
             <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
             <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    res.json({ ok: true, message: "Message sent successfully. We will get back to you soon." });
  } catch (err) {
    console.error("[contact] error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to send message. Please try again." });
  }
});

/* ---------- Reservations ---------- */
app.post("/api/reservations", contactLimiter, honeypot, async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, notes } = req.body || {};
    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({ ok: false, message: "Name, email, date, time, and guests are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email address." });
    }
    const guestCount = parseInt(guests, 10);
    if (isNaN(guestCount) || guestCount < 1 || guestCount > 50) {
      return res.status(400).json({ ok: false, message: "Number of guests must be between 1 and 50." });
    }

    const reservations = readDB("reservations");
    const newReservation = {
      id: Date.now(),
      name,
      email,
      phone: phone || "",
      date,
      time,
      guests: guestCount,
      notes: notes || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };
    reservations.push(newReservation);
    writeDB("reservations", reservations);

    await sendEmail({
      to: EMAIL_TO,
      subject: `New Reservation: ${name} on ${date}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nDate: ${date}\nTime: ${time}\nGuests: ${guestCount}\nNotes: ${notes || "None"}`,
      html: `<h2>New Table Reservation</h2>
             <p><strong>Name:</strong> ${escapeHtml(name)}</p>
             <p><strong>Email:</strong> ${escapeHtml(email)}</p>
             <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
             <p><strong>Date:</strong> ${escapeHtml(date)}</p>
             <p><strong>Time:</strong> ${escapeHtml(time)}</p>
             <p><strong>Guests:</strong> ${guestCount}</p>
             <p><strong>Notes:</strong><br>${escapeHtml(notes || "None").replace(/\n/g, "<br>")}</p>`,
    });
    res.json({ ok: true, message: "Reservation submitted successfully! We will confirm shortly." });
  } catch (err) {
    console.error("[reservation] error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to submit reservation. Please try again." });
  }
});

/* ---------- Reviews ---------- */
app.get("/api/reviews", (req, res) => {
  const status = req.query.status || "approved";
  let reviews = readDB("reviews");
  if (status && status !== "all") {
    reviews = reviews.filter((r) => r.status === status);
  }
  reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ ok: true, reviews });
});

app.post("/api/reviews", reviewLimiter, honeypot, (req, res) => {
  const { name, rating, text } = req.body || {};
  if (!name || !rating || !text) {
    return res.status(400).json({ ok: false, message: "Name, rating, and review text are required." });
  }
  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ ok: false, message: "Rating must be between 1 and 5." });
  }
  if (text.length > 2000) {
    return res.status(400).json({ ok: false, message: "Review too long. Maximum 2000 characters." });
  }

  const reviews = readDB("reviews");
  reviews.push({
    id: Date.now(),
    name,
    rating: ratingNum,
    text,
    status: "pending",
    created_at: new Date().toISOString(),
  });
  writeDB("reviews", reviews);

  res.json({
    ok: true,
    message: "Thank you for your review! It will be published after moderation.",
    id: Date.now(),
  });
});

/* ---------- Gallery Upload ---------- */
app.post("/api/gallery/upload", uploadLimiter, upload.array("images", 5), (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ ok: false, message: "No files uploaded." });
  }
  const category = (req.body.category || "general").replace(/[^a-zA-Z0-9-_]/g, "");
  const gallery = readDB("gallery");
  const uploaded = [];

  req.files.forEach((file) => {
    const relativePath = path.join("uploads", category, file.filename).replace(/\\/g, "/");
    gallery.push({
      id: Date.now() + Math.random(),
      filename: relativePath,
      original_name: file.originalname,
      category,
      title: req.body.title || file.originalname,
      description: req.body.description || "",
      uploaded_at: new Date().toISOString(),
    });
    uploaded.push({
      filename: file.filename,
      original: file.originalname,
      category,
      url: `/${relativePath}`,
    });
  });

  writeDB("gallery", gallery);
  res.json({ ok: true, uploaded });
});

/* ---------- Gallery List ---------- */
app.get("/api/gallery", (req, res) => {
  const category = req.query.category;
  let images = readDB("gallery");
  if (category) {
    images = images.filter((img) => img.category === category);
  }
  images.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
  res.json({ ok: true, images });
});

/* ---------- Admin: Moderate Reviews ---------- */
app.patch("/api/admin/reviews/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body || {};
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, message: "Invalid status. Must be 'approved' or 'rejected'." });
  }
  const reviews = readDB("reviews");
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ ok: false, message: "Review not found." });
  reviews[index].status = status;
  writeDB("reviews", reviews);
  res.json({ ok: true, message: `Review ${status}.` });
});

/* ---------- Admin: Delete Review ---------- */
app.delete("/api/admin/reviews/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  let reviews = readDB("reviews");
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ ok: false, message: "Review not found." });
  reviews.splice(index, 1);
  writeDB("reviews", reviews);
  res.json({ ok: true, message: "Review deleted." });
});

/* ---------- Admin: Get All Reservations ---------- */
app.get("/api/admin/reservations", (req, res) => {
  const reservations = readDB("reservations");
  reservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ ok: true, reservations });
});

/* ---------- Error Handlers ---------- */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ ok: false, message: "File too large. Maximum 8MB." });
    }
    return res.status(400).json({ ok: false, message: err.message });
  }
  if (err) {
    console.error("[server] error:", err.message);
    return res.status(400).json({ ok: false, message: err.message || "Bad request." });
  }
  next();
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Endpoint not found." });
});

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(`\nðŸŒ¹ tsgereda Hotel â€” A Living Memory of Piassa`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Frontend: ${PUBLIC_DIR}`);
  console.log(`   Uploads: ${UPLOAD_DIR}`);
  console.log(`   Data: ${DATA_DIR}`);
  console.log(`   Email: ${process.env.SMTP_HOST ? "Configured" : "Not configured (simulated)"}\n`);
});

/* ---------- Helpers ---------- */
function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


