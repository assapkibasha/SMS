
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();

//middleware
app.use(cors());
app.use(bodyParser.json());

//mysql pool connection pool

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//test connection

pool.getConnection()
.then(conn => {
    console.log('mysql Connected');
    conn.release();
}).catch(err => console.error('mysql failed to connect:',err));


//routes

app.get('/api/test', (req, res) =>{
    res.json({message: 'backend is running'
    });
});

const Port = process.env.PORT || 5000;
app.use('/api/admin',
    require('./routes/adminRoutes')
);
app.use('/api/class',
    require('./routes/classRoutes')
);
app.use('/api/teacher',
    require('./routes/teacherRoutes')
);
app.use('/api/students',
    require('./routes/studentRoutes')
);
app.use('/api/attendance',
    require('./routes/attendanceRoutes')
);
app.use('/api/auth', 
    require('./routes/authRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

module.exports = app;

