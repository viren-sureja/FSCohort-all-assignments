const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
	const { username, password } = req.headers;
	const admin = ADMINS.find(
		admin => admin.username === username && admin.password === password
	);
	if (admin) {
		next();
	} else {
		res.status(403).json({ message: 'Admin authentication failed' });
	}
};

const userAuthentication = (req, res, next) => {
	const { username, password } = req.headers;
	const existingUser = USERS.find(
		existingUser =>
			existingUser.username == username && existingUser.password == password
	);
	if (existingUser) {
		req.user = existingUser; // add user to the request
		next();
	} else {
		res.status(403).json({ message: 'User authentication failed' });
	}
};

app.post('/admin/signup', (req, res) => {
	const user = req.body;
	const existingAdmin = ADMINS.find(admin => admin.username == user.username);
	if (existingAdmin) {
		res.status(403).json({ message: 'Admin already exists' });
	} else {
		ADMINS.push(user);
		res.status(200).json({ message: 'Admin created successfully' });
	}
});

app.post('/admin/login', adminAuthentication, (req, res) => {
	res.json({ message: 'Logged in successfully' });
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
	const course = req.body;
	course.id = Date.now();
	COURSES.push(course);
	res.json({ message: 'Course created successfully', courseId: course.id });
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
	const courseId = Number(req.params.courseId);
	const course = COURSES.find(course => course.id === courseId);
	if (course) {
		Object.assign(course, req.body);
		res.json({ message: 'Course updated successfully' });
	} else {
		res.status(404).json({ message: 'Course not found' });
	}
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
	res.json({ courses: COURSES });
});

app.post('/users/signup', (req, res) => {
	const user = { ...req.body, purchasedCourses: [] };
	const existingUser = USERS.find(
		existingUser => existingUser.username == user.username
	);
	if (existingUser) {
		res.status(403).json({ message: 'User already exists' });
	} else {
		user.purchasedCourses = [];
		USERS.push(user);
		res.json({ message: 'User created successfully' });
	}
});

app.post('/users/login', userAuthentication, (req, res) => {
	res.json({ message: 'Logged in successfully' });
});

app.get('/users/courses', userAuthentication, (req, res) => {
	const publishedCourses = COURSES.filter(course => course.published);
	res.json({ courses: publishedCourses });
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
	const courseId = Number(req.params.courseId);
	const course = COURSES.find(c => c.id === courseId && c.published);
	if (course) {
		req.user.purchasedCourses.push(courseId);
		res.json({ message: 'Course purchased successfully' });
	} else {
		res.status(404).json({ message: 'Course not found or not available' });
	}
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
	const purchasedCourses = COURSES.filter(c =>
		req.user.purchasedCourses.includes(c.id)
	);
	res.json({ purchasedCourses: purchasedCourses });
});

app.listen(3000, () => {
	console.log('Server is listening on port 3000');
});
