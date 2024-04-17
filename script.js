const e = require("express");

function validateLogin() {
    // Get the name from the input field
    var name = document.getElementById("name").value;
    // Store the username in localStorage
    localStorage.setItem("username", name); 
    // Call the asynchronous function to get the roll number of the person with the highest score
    getRollNumberOfHighestScore()
        .then(function(rollNumber) {
            // Log the roll number of the person with the highest score
            console.log("Roll number of person with highest score:", rollNumber);
            // Store the roll number in localStorage
            localStorage.setItem("rollno", rollNumber);
            // Redirect to the match page
            window.location.href = 'match.html';
        })
        .catch(function(error) {
            // Log and handle errors
            console.error("Error getting roll number:", error);
            // Set rollno to an empty string in case of error
            localStorage.setItem("rollno", ""); 
            // Redirect to the match page even in case of error
            window.location.href = 'match.html'; 
        });
}

// Function to get the selected gender from the radio buttons
function getSelectedGender() {
    var selectedGender = document.querySelector('input[name="gender"]:checked').value;
    return selectedGender;
}

// Function to load JSON data from students.json
function loadJSON() {
    // Fetch the JSON data
    return fetch('students.json')
        .then(function(response) {
            // Parse the response as JSON
            return response.json();
        })
        .catch(function(error) {
            // Log and handle errors
            console.error('Error loading JSON:', error);
            // Throw the error to be caught by the caller
            throw error;
        });
}

// Function to get the roll numbers of students with the opposite gender
function getOppositeGenderNames() {
    // Call the function to load JSON data
    return loadJSON()
        .then(function(jsonData) {
            // Get the selected gender
            var selectedGender = getSelectedGender();
            // Determine the opposite gender
            const oppositeGender = selectedGender === 'male' ? 'female' : 'male';

            // Filter the JSON data to get roll numbers of students with the opposite gender
            const oppositeGenderNames = jsonData.filter(function(student) {
                return student.Gender.toLowerCase() === oppositeGender.toLowerCase();
            }).map(function(student) {
                return student['IITB Roll Number'];
            });

            // Log the names of students with the opposite gender
            console.log("Names of students with opposite gender:", oppositeGenderNames);
            // Return the array of roll numbers
            return oppositeGenderNames;
        })
        .catch(function(error) {
            // Log and handle errors
            console.error('Error getting opposite gender names:', error);
            // Throw the error to be caught by the caller
            throw error;
        });
}

// Function to get the roll number of the student with the highest score
function getRollNumberOfHighestScore() {
    // Call the function to get the roll numbers of students with the opposite gender
    return getOppositeGenderNames()
        .then(function(oppositeGenderRollNumbers) {
            // Call the function to load JSON data
            return loadJSON()
                .then(function(jsonData) {
                    // Get the selected interests and hobbies from the HTML form
                    const selectedInterests = Array.from(document.querySelectorAll('.Interests input[type=checkbox]:checked')).map(input => input.value);
                    const selectedHobbies = Array.from(document.querySelectorAll('.hobbies input[type=checkbox]:checked')).map(input => input.value);
                    const age = document.getElementById("age").value;
                    const year = document.getElementById("year").value;

                    let highestScore = 0;
                    let rollNumberOfHighestScore = '';
                    let ageDifference = 0;
                    let yearofmatch="";

                    // Iterate over each roll number of students with the opposite gender
                    for (const rollNumber of oppositeGenderRollNumbers) {
                        // Filter students with the same roll number
                        const studentsWithSameRollNumber = jsonData.filter(function(student) {
                            return student['IITB Roll Number'] === rollNumber;
                        });

                        // Calculate the score for each student based on interests and hobbies
                        studentsWithSameRollNumber.forEach(function(student) {
                            let score = 0;
                            
                            // Increase the score for matching interests
                            student.Interests.forEach(function(interest) {
                                if (selectedInterests.includes(interest)) {
                                    score += 1;
                                }
                            });

                            // Increase the score for matching hobbies
                            student.Hobbies.forEach(function(hobby) {
                                if (selectedHobbies.includes(hobby)) {
                                    score += 1;
                                }
                            });
                            // Log the score for each student
                            console.log(`Score for student ${student.Name} with roll number ${rollNumber}: ${score}`);

                            // Check if this student has the highest score so far
                            if (score > highestScore) {
                                highestScore = score;
                                rollNumberOfHighestScore = student['IITB Roll Number'];
                                ageDifference = Math.abs(student.Age - age);
                                yearofmatch = student.Year;
                            }
                            else if(score == highestScore){
                                if (Math.abs(student.Age - age) < ageDifference){
                                    highestScore = score;
                                    rollNumberOfHighestScore = student['IITB Roll Number'];
                                    ageDifference = Math.abs(student.Age - age);
                                }
                                else if(year == student.Year){
                                    highestScore = score;
                                    rollNumberOfHighestScore = student['IITB Roll Number'];
                                    yearofmatch = student.Year;
                                    ageDifference = Math.abs(student.Age - age);
                                }
                            }
                             
                        });
                    }

                    
                    console.log(highestScore)
                    // Store the highest score in localStorage
                    localStorage.setItem("score", highestScore);

                    // Return 'nomatch' if the highest score is zero
                    if (highestScore === 0) {
                        return 'nomatch';
                    }

                    // Return the roll number of the student with the highest score
                    return rollNumberOfHighestScore;
                });
        })
        .catch(function(error) {
            // Log and handle errors
            console.error('Error getting roll number of highest score:', error);
            // Return null in case of error
            return null;
        });
}

