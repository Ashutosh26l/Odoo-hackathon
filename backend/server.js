import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 5000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(express.json());
app.use(cors());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Middleware to verify agent role
const verifyAgent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (data.role !== 'agent' && data.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Agent role required.' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /signup route for user registration
app.post('/signup', async (req, res) => {
  const { name, gender, email, password, category } = req.body; // Removed role parameter

  if (!name || !gender || !email || !password || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Removed role from insert - database will use default 'end-user'
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, gender, email, password: hashedPassword, category }])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error creating user: ' + error.message });
    }

    res.status(201).json({ message: 'User created successfully', user: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /login route for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password, role, name')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        { id: data.id, email: data.email, role: data.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ 
        token, 
        user: { 
          id: data.id, 
          email: data.email, 
          role: data.role, 
          name: data.name 
        } 
      });
    } else {
      return res.status(400).json({ message: 'Incorrect password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route to get user profile info
app.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all profile fields including name, gender, category
    const { data, error } = await supabase
      .from('users')
      .select('id, name, gender, email, category, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Return complete user profile
    res.status(200).json({ 
      user: {
        id: data.id,
        name: data.name,
        gender: data.gender,
        email: data.email,
        category: data.category,
        role: data.role,
        created_at: data.created_at
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /profile route to update user profile
app.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gender, category } = req.body;

    // Validate required fields
    if (!name || !gender || !category) {
      return res.status(400).json({ message: 'Name, gender, and category are required' });
    }

    // Update user profile (email and role should not be editable)
    const { data, error } = await supabase
      .from('users')
      .update({ 
        name, 
        gender, 
        category 
      })
      .eq('id', userId)
      .select('id, name, gender, email, category, role, created_at')
      .single();

    if (error) {
      return res.status(400).json({ message: 'Error updating profile: ' + error.message });
    }

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: data
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// POST /upgrade-request  -> end-user asks to become agent
app.post('/upgrade-request', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user to confirm role
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userErr || !userData) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (userData.role !== 'end-user') {
      return res.status(400).json({ message: 'Only end-users can request an upgrade' });
    }

    // Prevent duplicate pending requests
    const { data: existing } = await supabase
      .from('approval')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    // Insert new approval request - Using double quotes for current_role
    const { data, error } = await supabase
      .from('approval')
      .insert([{
        user_id: userId,
        current_role: 'end-user',      // This will work with double quotes in table
        requested_role: 'agent',
        status: 'pending'
      }])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error submitting request: ' + error.message });
    }

    res.status(201).json({ message: 'Upgrade request created', request: data[0] });
  } catch (err) {
    console.error('Upgrade request error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// GET /tickets route for end users
app.get('/tickets', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('id, question, description, tags, username, status, upvote_count, conversation_count, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({ message: 'Error fetching tickets' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ---------------------------------- AGENT ROUTES ----------------------------------

// GET /agent/tickets - Get all tickets for agents
app.get('/agent/tickets', verifyToken, verifyAgent, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('id, question, description, tags, username, status, upvote_count, conversation_count, created_at, assigned_agent')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets for agent:', error);
      return res.status(500).json({ message: 'Error fetching tickets' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching tickets for agent:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /agent/tickets/:id - Get specific ticket details
app.get('/agent/tickets/:id', verifyToken, verifyAgent, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching ticket details:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /agent/tickets/:id/status - Update ticket status
app.put('/agent/tickets/:id/status', verifyToken, verifyAgent, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        assigned_agent: req.user.email
      })
      .eq('id', ticketId)
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error updating ticket status: ' + error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({ message: 'Ticket status updated successfully', ticket: data[0] });
  } catch (err) {
    console.error('Error updating ticket status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /agent/tickets/:id/comment - Add comment to ticket
app.post('/agent/tickets/:id/comment', verifyToken, verifyAgent, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    // First, check if ticket exists
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticketData) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Add comment using conversations table
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        ticket_id: ticketId,
        user_id: userId,
        message: comment,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error adding comment: ' + error.message });
    }

    // Update conversation count
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        conversation_count: supabase.raw('conversation_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('Error updating conversation count:', updateError);
    }

    res.status(201).json({ message: 'Comment added successfully', comment: data[0] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /agent/tickets/:id/comments - Get comments for a ticket
app.get('/agent/tickets/:id/comments', verifyToken, verifyAgent, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        users:user_id (
          name,
          email,
          role
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Error fetching comments: ' + error.message });
    }

    res.status(200).json(data || []);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /tickets - Create new ticket
app.post('/tickets', verifyToken, async (req, res) => {
  try {
    const { question, description, tags } = req.body;
    const userId = req.user.id;

    if (!question || !description || !tags || tags.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name, role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(400).json({ message: 'User not found' });
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        question,
        description,
        tags,
        username: userData.email,
        status: 'open',
        upvote_count: 0,
        conversations: 0,
        conversation_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error creating ticket: ' + error.message });
    }

    res.status(201).json({ 
      message: 'Ticket created successfully', 
      ticket: data[0] 
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /tickets/:id/upvote - Upvote a ticket
app.post('/tickets/:id/upvote', verifyToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    // Check if user already upvoted this ticket
    const { data: existingUpvote, error: checkError } = await supabase
      .from('upvotes')
      .select('id')
      .eq('ticket_id', ticketId)
      .eq('user_id', userId)
      .single();

    if (existingUpvote) {
      return res.status(400).json({ message: 'You have already upvoted this ticket' });
    }

    // Add upvote
    const { data, error } = await supabase
      .from('upvotes')
      .insert([{
        ticket_id: ticketId,
        user_id: userId,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error adding upvote: ' + error.message });
    }

    // Update upvote count in tickets table
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        upvote_count: supabase.raw('upvote_count + 1')
      })
      .eq('id', ticketId);

    if (updateError) {
      return res.status(400).json({ message: 'Error updating upvote count: ' + updateError.message });
    }

    res.status(201).json({ message: 'Ticket upvoted successfully' });
  } catch (err) {
    console.error('Error upvoting ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /categories
app.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('category').select('*');
    
    if (error) {
      return res.status(500).json({ message: 'Error fetching categories' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /categories
app.post('/categories', verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Check if user is admin or agent
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'agent')) {
      return res.status(403).json({ message: 'Forbidden: Only admins and agents can create categories' });
    }

    const { data, error } = await supabase
      .from('category')
      .insert([{ name }])
      .select();

    if (error) {
      return res.status(400).json({ message: 'Error creating category: ' + error.message });
    }

    res.status(201).json({ message: 'Category created successfully', category: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /end-user/my-tickets - Get tickets created by the logged-in end user
app.get('/end-user/my-tickets', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const { data, error } = await supabase
      .from('tickets')
      .select('id, question, description, tags, status, upvote_count, conversation_count, created_at, assigned_agent')
      .eq('username', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tickets:', error);
      return res.status(500).json({ message: 'Error fetching your tickets' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
