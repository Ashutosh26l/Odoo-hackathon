<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 1000px; margin: auto;">

<h1>🚀 QuickDesk – Help Desk Ticketing System</h1>
<p>A modern, full-stack help-desk platform built with <strong>React</strong>, <strong>Node.js/Express</strong>, and <strong>Supabase</strong>. QuickDesk streamlines ticket handling, role-based workflows and team collaboration.</p>

<p>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen" />
  <img src="https://img.shields.io/badge/React-18.3.1-blue" />
  <img src="https://img.shields.io/badge/Node.js-Express-green" />
  <img src="https://img.shields.io/badge/Database-Supabase-orange" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC" />
</p>

<hr/>

<h2>🚀 Features</h2>

<h3>🔐 Authentication & Authorization</h3>
<ul>
  <li>Email / password login secured with JWT</li>
  <li>Three roles: <strong>end-user</strong>, <strong>agent</strong>, <strong>admin</strong></li>
  <li>Protected routes + token-expiry handling</li>
  <li>Editable user profiles</li>
</ul>

<h3>🎫 Ticket Management</h3>
<ul>
  <li>Full CRUD on tickets</li>
  <li>Status flow: <strong>Open → In Progress → Resolved → Closed</strong></li>
  <li>Categories, tags, search & filter</li>
  <li>Up-votes for prioritisation</li>
  <li>Comment/conversation tracking</li>
</ul>

<h3>👥 User & Role Management</h3>
<ul>
  <li>End-user profile + ticket history</li>
  <li>Agent dashboard with all tickets</li>
  <li>Admin tools for role upgrade approval & category management</li>
  <li>Upgrade-request workflow (end-user → agent)</li>
</ul>

<h3>Login Credential</h3>
<ul>
  <li>Admin: admin@gmail.com  pass: admin</li>
  <li>Agent: agent@gmail.com  pass: agent</li>
  <li>User : user@gmail.com   pass: user</li>
  
</ul>

<h3>🖥 Modern UI/UX</h3>
<ul>
  <li>Responsive Tailwind design</li>
  <li>Role-aware navbar (Login / Logout, Dashboard, Profile)</li>
  <li>Loading spinners & error messages</li>
</ul>

<hr/>

<h2>🛠 Tech Stack</h2>
<table border="1" cellpadding="6" cellspacing="0">
<thead><tr><th>Layer</th><th>Tools/Libs</th></tr></thead>
<tbody>
<tr><td>Frontend</td><td>React 18, React-Router v6, Tailwind CSS</td></tr>
<tr><td>Backend</td><td>Node.js, Express, JWT, bcryptjs</td></tr>
<tr><td>Database</td><td>Supabase (PostgreSQL + Auth + Storage)</td></tr>
<tr><td>Dev Tools</td><td>Vite, ESLint, dotenv, Git</td></tr>
</tbody>
</table>

<hr/>

<h2>📋 Prerequisites</h2>
<ul>
  <li>Node.js ≥ 16</li>
  <li>npm / yarn</li>
  <li>Git</li>
  <li>Supabase account (free tier works)</li>
</ul>

<hr/>
<h2>⚡ Installation</h2>
<pre><code>git clone https://github.com/Ashutosh26l/Odoo-hackathon.git
cd quickdesk-helpdesk-system</code></pre>

<h3>1 – Install dependencies</h3>
<p><strong>Frontend</strong></p>
<pre><code>cd frontend
npm install</code></pre>

<p><strong>Backend</strong></p>
<pre><code>cd ../backend
npm install</code></pre>

<h3>2 – Configure Supabase</h3>
<ol>
  <li>Create a project on <a href="https://supabase.com">https://supabase.com</a></li>
  <li>Copy <strong>Project URL</strong> and <strong>Anon Key</strong></li>
  <li>Run the SQL scripts from the project</li>
</ol>

<h3>3 – Environment Variables</h3>
<p><code>backend/.env</code></p>
<pre><code>SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=super_secure_secret
PORT=5000</code></pre>

<p><code>frontend/.env</code></p>
<pre><code>VITE_API_URL=http://localhost:5000</code></pre>

<h3>4 – Run dev servers</h3>
<p><strong>Backend</strong></p>
<pre><code>cd backend
npm start</code></pre>

<p><strong>Frontend</strong></p>
<pre><code>cd ../frontend
npm run dev</code></pre>

<hr/>
<h2>🗺 Project Usage</h2>
<ol>
  <li><strong>Sign Up</strong> – end-user account is created</li>
  <li><strong>Create Ticket</strong> – via “Ask Question”</li>
  <li><strong>Agent</strong> – update a user’s <code>role</code> to <code>agent</code> in DB</li>
  <li><strong>Admin</strong> – update a user’s <code>role</code> to <code>admin</code></li>
  <li><strong>Role Upgrade</strong> – end-user can request upgrade in Profile</li>
</ol>

<h2>🔧 API Overview</h2>
<table border="1" cellpadding="6" cellspacing="0">
<thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
<tbody>
<tr><td>POST</td><td>/signup</td><td>User registration</td></tr>
<tr><td>POST</td><td>/login</td><td>User login</td></tr>
<tr><td>GET</td><td>/profile</td><td>Get profile</td></tr>
<tr><td>PUT</td><td>/profile</td><td>Update profile</td></tr>
<tr><td>GET</td><td>/tickets</td><td>All tickets (end-user filtered)</td></tr>
<tr><td>POST</td><td>/tickets</td><td>Create ticket</td></tr>
<tr><td>POST</td><td>/tickets/:id/upvote</td><td>Up-vote ticket</td></tr>
<tr><td>GET</td><td>/agent/tickets</td><td>All tickets (agent view)</td></tr>
<tr><td>PUT</td><td>/agent/tickets/:id/status</td><td>Update ticket status</td></tr>
<tr><td>POST</td><td>/agent/tickets/:id/comment</td><td>Add comment</td></tr>
<tr><td>POST</td><td>/upgrade-request</td><td>End-user requests agent role</td></tr>
<tr><td>GET / POST</td><td>/categories</td><td>Get / create categories</td></tr>
</tbody>
</table>

<h2>🚀 Deployment</h2>
<h3>Frontend – Vercel / Netlify</h3>
<pre><code>cd frontend
npm run build</code></pre>
<p>Then deploy the <code>dist</code> folder</p>

<h3>Backend – Railway / Render / Heroku</h3>
<ul>
  <li>Set env variables: <code>SUPABASE_URL</code>, <code>SUPABASE_KEY</code>, <code>JWT_SECRET</code></li>
  <li>Deploy the <code>backend</code> folder</li>
</ul>

<h2>🤝 Contributing</h2>
<ol>
  <li><strong>Fork</strong> the repo</li>
  <li><code>git checkout -b feature/my-feature</code></li>
  <li>Commit ➜ push ➜ open Pull Request</li>
</ol>

<p>Please follow existing code style, add tests where applicable, and update docs.</p>

<h2>📝 License</h2>
<p>MIT © 2025 QuickDesk Team</p>

<hr/>
<p>Built with ❤️ to make support ticket management simple, efficient & scalable.</p>

</body>
</html>
