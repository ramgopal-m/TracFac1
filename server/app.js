const concernsRoutes = require('./routes/concerns');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/concerns', concernsRoutes); 