const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const reviewFilePath = path.join(__dirname, 'review.json');
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));
let students = [];
fs.readFile('students.json', (err, data) => {
    if (err) {
      console.error(err);
        
      return;
    }
    students = JSON.parse(data);
  });

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'photos/'); // Directory where uploaded photos will be stored
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded photo
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
app.post('/newupdate-student', upload.single('photo'), (req, res) => {
    const formData = req.body;
    const rollno = formData.rollno;
  
    // Update the student data in the database with the new values provided in formData
    // Example:
    const studentIndex = students.findIndex(student => student['IITB Roll Number'] === rollno);
    if (studentIndex !== -1) {
      students[studentIndex] = {
        "IITB Roll Number": rollno,
        Name: formData.name,        
        'Year of Study': formData.year,
        Age: parseInt(formData.age),
        Gender: formData.gender,
        Email: formData.email,
        Interests: formData.Interests,
        Hobbies: formData.Hobbies,
        Comments: formData.comment ? formData.comment : '',
        Photo: req.file ? 'photos/' + req.file.filename : students[studentIndex].Photo, // Update photo if provided, else keep existing photo
        likeCount: students[studentIndex].likeCount // Keep the existing like count
      };
      fs.writeFile('students.json', JSON.stringify(students, null, 2), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }
        // Respond with success message
        res.send(`<script>alert('Student data updated successfully.'); localStorage.setItem("myprofile", '${students[studentIndex]["IITB Roll Number"]}'); window.location.href='/myprofile.html';</script>`);
      });
    } else {
      // If student with given roll number is not found, respond with error message
      res.status(404).send('Student not found.');
    }
  });
    
  
    // Save the updated data to the database (e.g., students.json)
  
    // Redirect to a confirmation page or send a response


app.post('/update-student', upload.single('photo'), (req, res) => {
    // console.log('Form data:', req.body);

    const formData = req.body;
    
    // Read the students.json file
    fs.readFile('students.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        let students = JSON.parse(data);
        console.log('Parsed students object:', students);

        // Find the student by roll number
        const studentIndex = students.findIndex(student => student['IITB Roll Number'] === formData.rollno);

        // Check if the student already exists
        if (studentIndex !== -1) {
            // Student already exists, send alert message through popup terminal
            res.send(`<script>alert('Student with the provided roll number already exists.'); window.location.href='/add_profile.html';</script>`);
        } else {
            // Add new student
            const newStudent = {
                "IITB Roll Number": formData.rollno,
                Name: formData.name,
                'Year of Study': formData.year,
                Age: parseInt(formData.age),
                Gender: formData.gender,
                Email: formData.email,
                Photo: req.file ? 'photos/' + req.file.filename : '', // Save photo path if uploaded, else empty string
                Interests: formData.Interests,
                Hobbies: formData.Hobbies,
                Comments: formData.comment ? formData.comment : '' // If comment is provided, use it, else use an empty string
            };
            // console.log('New Student Object:', newStudent);

            students.push(newStudent);
            // Write the updated data back to students.json
            fs.writeFile('students.json', JSON.stringify(students, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Redirect to welcome.html
                res.send(`<script>alert('Student data updated successfully.'); localStorage.setItem("myprofile", '${newStudent["IITB Roll Number"]}'); window.location.href='/myprofile.html';</script>`);
            });
        }
    });
});



// Route to handle registering a new user
app.post('/register', (req, res) => {
    const { username, password, secret_question, secret_answer } = req.body;

    // Read the existing data from login.json
    fs.readFile(path.join(__dirname, 'login.json'), (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading login data');
            return;
        }

        let loginData = JSON.parse(data);

        // Check if the username already exists
        const existingUser = loginData.find(user => user.username === username);
        if (existingUser) {
            // Username already exists, send a message to retry
            res.send(`<script>alert('Username already exists. Please retry.'); window.location.href = '/register.html';</script>`);
            return;
        }

        // Username does not exist, add the new user
        const newUser = {
            username,
            password,
            secret_question,
            secret_answer
        };
        loginData.push(newUser);

        // Write the updated data back to login.json
        fs.writeFile(path.join(__dirname, 'login.json'), JSON.stringify(loginData, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing login data');
                return;
            }
            // Registration successful, redirect to login.html
            res.send(`<script>alert('Registration successful.'); window.location.href = '/login.html';</script>`);
        });
    });
});

// Route to handle liking a profile
app.post('/like-profile/:rollNumber', (req, res) => {
    const rollNumber = req.params.rollNumber;

    // Read the students.json file
    fs.readFile(path.join(__dirname, 'students.json'), (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal server error');
            return;
        }

        let profiles = JSON.parse(data);

        // Find the profile with the specified IITB Roll Number
        let profile = profiles.find(profile => profile['IITB Roll Number'] === rollNumber);

        if (!profile) {
            console.error('Profile not found');
            res.status(404).send('Profile not found');
            return;
        }

        // Increment the likeCount or set it to 1 if it doesn't exist
        if (profile.likeCount) {
            profile.likeCount++;
        } else {
            profile.likeCount = 1;
        }

        // Write the updated JSON data back to the file
        fs.writeFile(path.join(__dirname, 'students.json'), JSON.stringify(profiles, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Internal server error');
                return;
            }
            console.log('Like count updated successfully');
            res.status(200).send('Like count updated successfully');
        });
    });
});

app.post('/review', (req, res) => {
    console.log(req.body);
    const reviewName = req.body.reviewName;
    const reviewText = req.body.reviewText;
    console.log('Review:', reviewName, reviewText);
  
    // // Create a review object
    const review = {
      Name: reviewName,
      Review: reviewText
    };
  
    // Check if review.json exists
    if (!fs.existsSync(reviewFilePath)) {
      // If not, create it with an empty array
      fs.writeFileSync(reviewFilePath, '[]');
    }
  
    // Read existing reviews from file
    fs.readFile(reviewFilePath, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).send('Error submitting review');
      }
  
      let reviews = JSON.parse(data);
      reviews.push(review);
  
      // Write updated reviews back to file
      fs.writeFile(reviewFilePath, JSON.stringify(reviews, null, 2), (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return res.status(500).send('Error submitting review');
        }
        
        res.send(`<script>alert('Review submitted successfully');  window.location.href='/user.html';</script>`);
      });
    });
  });
  app.post('/review2', (req, res) => {
    console.log(req.body);
    const reviewName = req.body.reviewName;
    const reviewText = req.body.reviewText;
    console.log('Review:', reviewName, reviewText);
  
    // // Create a review object
    const review = {
      Name: reviewName,
      Review: reviewText
    };
  
    // Check if review.json exists
    if (!fs.existsSync(reviewFilePath)) {
      // If not, create it with an empty array
      fs.writeFileSync(reviewFilePath, '[]');
    }
  
    // Read existing reviews from file
    fs.readFile(reviewFilePath, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).send('Error submitting review');
      }
  
      let reviews = JSON.parse(data);
      reviews.push(review);
  
      // Write updated reviews back to file
      fs.writeFile(reviewFilePath, JSON.stringify(reviews, null, 2), (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return res.status(500).send('Error submitting review');
        }
        
        res.send(`<script>alert('Review submitted successfully');  window.location.href='/welcome.html';</script>`);
      });
    });
  });
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
