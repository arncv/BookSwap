const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer'); // Import multer

// Basic configuration
const port = process.env.PORT || 3001; // Use environment variable or default to 3001
const UPLOADS_DIR = 'uploads'; // Define uploads directory constant
const UPLOADS_PATH = path.join(__dirname, UPLOADS_DIR); // Full path to uploads

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend requests
app.use(express.json()); // Enable parsing of JSON request bodies

// Serve static files from the uploads directory
app.use(`/${UPLOADS_DIR}`, express.static(UPLOADS_PATH));

// --- Database Setup ---
const DB_PATH = path.join(__dirname, 'database.json');

// Function to read the database file
const readDB = () => {
  try {
    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_PATH)) {
        fs.mkdirSync(UPLOADS_PATH, { recursive: true });
        console.log(`Created directory: ${UPLOADS_PATH}`);
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    // If file doesn't exist or is corrupted, return default structure
    return { users: [], books: [] };
  }
};

// Function to write to the database file
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing to database:", error);
  }
};

// Load initial database state
let db = readDB();
// Ensure db structure if file was empty/new
db.users = db.users || [];
db.books = db.books || [];


// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_PATH); // Save files to the uploads directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// File filter (optional: accept only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });


// --- Helper Functions ---
const isValidEmail = (email) => {
  // Simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// --- API Routes ---

// User Registration
app.post('/api/users/register', (req, res) => {
  const { name, mobileNumber, email, password, role } = req.body;

  // Enhanced validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields: name, email, password, role.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 6) { // Example: Minimum 6 characters
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }
  if (role !== 'Owner' && role !== 'Seeker') {
      return res.status(400).json({ message: 'Role must be either "Owner" or "Seeker".' });
  }

  try {
    // Check if user already exists
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

  // Create new user
  const newUser = {
    id: uuidv4(),
    name,
    mobileNumber: mobileNumber || '', // Optional field
    email,
    password, // Storing plain text as requested
    role
  };

    // Add to DB and save
    db.users.push(newUser);
    writeDB(db);

  // Return relevant user info (excluding password)
  res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
  });
 } catch (error) {
     console.error("Error during user registration:", error);
     return res.status(500).json({ message: 'Internal server error during registration.' });
 }
});


// User Login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  // Enhanced validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields: email, password.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    // Find user by email
    const user = db.users.find(u => u.email === email);

    // Check if user exists and password matches (plain text comparison)
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

  // Login successful - return user info (excluding password) and a mock token
  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: `mock-token-for-${user.id}` // Simple mock token
  });
 } catch (error) {
     console.error("Error during user login:", error);
     return res.status(500).json({ message: 'Internal server error during login.' });
 }
});


// Get all books (with optional filtering and owner info)
app.get('/api/books', (req, res) => {
  const { title, location, genre } = req.query; // Get potential query params including genre

  try {
  let filteredBooks = [...db.books]; // Start with all books

  // Apply filters if query parameters exist
  if (title) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  if (location) {
    filteredBooks = filteredBooks.filter(book =>
      book.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  if (genre) {
    const lowerCaseGenre = genre.toLowerCase();
    filteredBooks = filteredBooks.filter(book =>
      book.genre && book.genre.toLowerCase() === lowerCaseGenre
    );
  }

  // Enhance book data with owner's details (name, email, mobile)
  const enhancedBooks = filteredBooks.map(book => {
    const owner = db.users.find(user => user.id === book.ownerId);
    return {
      ...book, // Includes coverImageUrl if present
      // Include ownerInfo only if owner is found, otherwise null
      ownerInfo: owner ? {
        name: owner.name,
        email: owner.email,
        mobile: owner.mobileNumber || '' // Use mobileNumber field, default to empty string if missing
      } : null
    };
  });

    res.json(enhancedBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({ message: 'Internal server error fetching books.' });
  }
});

// Add a new book listing
app.post('/api/books', (req, res) => {
  // TODO: Add authentication check here to ensure only 'Owner' can add books
  // For now, we assume the request is valid and includes necessary info implicitly or via a mock header/token later
  const mockUserId = req.headers['x-user-id']; // Use mock user ID from header for ownerId

  const { title, author, genre, location, contact } = req.body; // ownerId comes from header now

  // Enhanced validation
  if (!title || !author || !location || !contact || !mockUserId) { // Check mockUserId from header
    return res.status(400).json({ message: 'Missing required fields: title, author, location, contact, or missing x-user-id header.' });
  }
  // Type validation
  if (typeof title !== 'string' || typeof author !== 'string' || typeof location !== 'string' || typeof contact !== 'string' || (genre && typeof genre !== 'string')) {
      return res.status(400).json({ message: 'Invalid data type for one or more fields (title, author, genre, location, contact must be strings).' });
  }

  try {
    // Verify ownerId exists in db.users and has role 'Owner'
    const owner = db.users.find(u => u.id === mockUserId && u.role === 'Owner');
    if (!owner) {
        console.warn(`Attempt to add book by non-owner or invalid ownerId: ${mockUserId}`);
        return res.status(403).json({ message: 'Forbidden: User is not authorized to add books or owner ID is invalid.' });
    }


  const newBook = {
    id: uuidv4(),
    title,
    author,
    genre: genre || '', // Optional
    location,
    contact,
    ownerId: mockUserId, // Link book to the owner from header
    status: 'Available', // Default status
    coverImageUrl: null // Initialize cover image URL as null
  };

  db.books.push(newBook);
    writeDB(db);

    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error adding book:", error);
    return res.status(500).json({ message: 'Internal server error adding book.' });
  }
});

// Get a specific book by ID
app.get('/api/books/:id', (req, res) => {
    const { id } = req.params;
    let book;
    try {
        book = db.books.find(b => b.id === id);
    } catch (error) {
        console.error("Error finding book by ID:", error);
        return res.status(500).json({ message: 'Internal server error finding book.' });
    }

    if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
    }

    let owner;
    try {
        // Enhance with owner info if needed
        owner = db.users.find(user => user.id === book.ownerId);
    } catch (error) {
        console.error("Error finding book owner:", error);
        // Non-fatal, proceed without owner info but log it
        owner = null; // Ensure owner is null if lookup fails
    }
    const enhancedBook = {
        ...book, // Includes coverImageUrl if present
        ownerInfo: owner ? {
            name: owner.name,
            email: owner.email,
            mobile: owner.mobileNumber || ''
        } : null
    };

    res.json(enhancedBook);
});


// Update book status
app.patch('/api/books/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const mockUserId = req.headers['x-user-id']; // Get mock user ID from header

  // Validate status input
  if (typeof status !== 'string' || (status !== 'Available' && status !== 'Rented/Exchanged')) {
    return res.status(400).json({ message: 'Invalid status value. Must be the string "Available" or "Rented/Exchanged".' });
  }

  let bookIndex;
  try {
    bookIndex = db.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found.' });
    }

  // Authorization Check (Basic Mock)
  const bookToUpdate = db.books[bookIndex];

  // If a mock user ID is provided, check if it matches the book's ownerId
    // If a mock user ID is provided, check if it matches the book's ownerId
    if (!mockUserId || bookToUpdate.ownerId !== mockUserId) { // Require mockUserId for this action
      return res.status(403).json({ message: 'Forbidden: You do not own this book or user ID is missing.' });
    }

  // Update the status
  db.books[bookIndex].status = status;
    writeDB(db);

    res.json(db.books[bookIndex]); // Return the updated book
  } catch (error) {
    console.error("Error updating book status:", error);
    return res.status(500).json({ message: 'Internal server error updating book status.' });
  }
});


// Delete a book
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const mockUserId = req.headers['x-user-id']; // Get mock user ID from header

  let bookIndex;
  let bookToDelete;
  try {
    // Find the index of the book to delete
    bookIndex = db.books.findIndex(b => b.id === id);

  // Handle book not found
    // Handle book not found
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    bookToDelete = db.books[bookIndex];

    // Authorization Check (Basic Mock)
    if (!mockUserId || bookToDelete.ownerId !== mockUserId) { // Require mockUserId for this action
      return res.status(403).json({ message: 'Forbidden: You do not own this book or user ID is missing.' });
    }

  // TODO: Delete associated cover image file if it exists
  if (bookToDelete.coverImageUrl) {
      const imagePath = path.join(__dirname, bookToDelete.coverImageUrl); // Construct full path
      fs.unlink(imagePath, (err) => {
          if (err) {
              // Log error but don't block deletion if file removal fails
              console.error(`Failed to delete cover image ${imagePath}:`, err);
          } else {
              console.log(`Deleted cover image: ${imagePath}`);
          }
      });
  }

  // Remove the book from the array
  db.books.splice(bookIndex, 1);

  // Write the updated database back to the file
    writeDB(db);

    // Return success response
    res.status(204).send(); // 204 No Content is appropriate for successful deletion
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({ message: 'Internal server error deleting book.' });
  }
});


// Update book details (PUT)
app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, genre, location, contact } = req.body;
  const mockUserId = req.headers['x-user-id']; // Get mock user ID from header

  // Enhanced validation for required fields and types
  if (!title || !author || !location || !contact) {
    return res.status(400).json({ message: 'Missing required fields: title, author, location, contact.' });
  }
  if (typeof title !== 'string' || typeof author !== 'string' || typeof location !== 'string' || typeof contact !== 'string' || (genre && typeof genre !== 'string')) {
      return res.status(400).json({ message: 'Invalid data type for one or more fields (title, author, genre, location, contact must be strings).' });
  }

  let bookIndex;
  let bookToUpdate;
  try {
    // Find the index of the book to update
    bookIndex = db.books.findIndex(b => b.id === id);

    // Handle book not found
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    bookToUpdate = db.books[bookIndex];

    // Authorization Check (Basic Mock)
    if (!mockUserId || bookToUpdate.ownerId !== mockUserId) { // Require mockUserId for this action
      return res.status(403).json({ message: 'Forbidden: You do not own this book or user ID is missing.' });
    }

  // Update the book properties, preserving id, ownerId, status, and coverImageUrl
  const updatedBook = {
    ...bookToUpdate, // Keep existing properties like id, ownerId, status, coverImageUrl
    title: title,
    author: author,
    genre: genre !== undefined ? genre : bookToUpdate.genre, // Update genre if provided, else keep old
    location: location,
    contact: contact,
  };

  // Update the book in the database array
  db.books[bookIndex] = updatedBook;

  // Write the updated database back to the file
    writeDB(db);

    // Return the fully updated book object
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("Error updating book details:", error);
    return res.status(500).json({ message: 'Internal server error updating book details.' });
  }
});

// Upload book cover image
app.post('/api/books/:id/cover', upload.single('coverImage'), (req, res) => {
    const { id } = req.params;
    const mockUserId = req.headers['x-user-id']; // Get mock user ID from header

    // Check if file was uploaded by multer (it handles basic presence)
    if (!req.file) {
        // This case might be redundant if multer's error handler catches it, but good for clarity
        return res.status(400).json({ message: 'No image file uploaded or invalid file type.' });
    }

    let bookIndex;
    let bookToUpdate;
    try {
      // Find the index of the book to update
      bookIndex = db.books.findIndex(b => b.id === id);

      // Handle book not found
      if (bookIndex === -1) {
          // Clean up uploaded file if book doesn't exist
          fs.unlink(req.file.path, (err) => {
              if (err) console.error("Error deleting orphaned upload:", err);
          });
          return res.status(404).json({ message: 'Book not found.' });
      }

      bookToUpdate = db.books[bookIndex];
      // Authorization Check (Basic Mock)
      if (!mockUserId || bookToUpdate.ownerId !== mockUserId) { // Require mockUserId for this action
          // Clean up uploaded file if unauthorized
          fs.unlink(req.file.path, (err) => {
              if (err) console.error("Error deleting unauthorized upload:", err);
          });
          return res.status(403).json({ message: 'Forbidden: You do not own this book or user ID is missing.' });
      }

    // Construct the relative URL path for the image
    // req.file.filename contains the unique name generated by multer
    const imageUrl = `/${UPLOADS_DIR}/${req.file.filename}`;

    // TODO: Delete old cover image file if one exists before updating
    if (bookToUpdate.coverImageUrl) {
        const oldImagePath = path.join(__dirname, bookToUpdate.coverImageUrl);
        fs.unlink(oldImagePath, (err) => {
            if (err && err.code !== 'ENOENT') { // Ignore 'file not found' errors
                console.error(`Failed to delete old cover image ${oldImagePath}:`, err);
            } else if (!err) {
                console.log(`Deleted old cover image: ${oldImagePath}`);
            }
        });
    }


    // Update the book's coverImageUrl
    db.books[bookIndex].coverImageUrl = imageUrl;

    // Write the updated database back to the file
      writeDB(db);

      // Return the updated book object (or just the URL)
      res.status(200).json(db.books[bookIndex]);
    } catch (error) {
        console.error("Error processing cover upload:", error);
        // Clean up uploaded file if DB update fails
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting upload after DB error:", unlinkErr);
            });
        }
        return res.status(500).json({ message: 'Internal server error processing cover upload.' });
    }
}, (error, req, res, next) => {
    // Handle Multer errors (e.g., file type filter)
    if (error instanceof multer.MulterError) {
        // A Multer error occurred when uploading (e.g., file size limit).
        return res.status(400).json({ message: `Upload error: ${error.message}` });
    } else if (error) {
        // An error from the fileFilter or other unknown error.
        return res.status(400).json({ message: error.message || 'File upload error.' });
    }
    // If no error, continue
    next();
});


// Basic root route
app.get('/', (req, res) => {
  res.send('Book Exchange Backend API is running!');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});