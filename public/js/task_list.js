// Get the form element by its ID
var form = document.getElementById("formId");

// Global variable pointing to the current user's Firestore document
var currentUser;

// Global variable to reference modal fields
var modalTitle;
var modalCourse;
var modalCategory;
var modalDate;
var modalDescription;

// Get the modal element by its ID
const exampleModal = document.getElementById('exampleModal');

//Function that calls everything needed for the main page  
function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            insertInfoFromFirestore();
            getTasks();
        } else {
            // No user is signed in.
            console.log("No user is signed in");
            //window.location.href = "/";
        }
    });
}
doAll();

// Check if the modal exists on the page
if (exampleModal) {
    // Add event listener for when the modal is shown
    exampleModal.addEventListener('show.bs.modal', event => {
        // Get the button that triggered the modal
        const button = event.relatedTarget;
        // Get the value of the 'data-bs-whatever' attribute of the button (e.g., "Add Task")
        const recipient = button.getAttribute('data-bs-whatever');

        // Get the modal input and textarea elements for task details
        modalTitle = exampleModal.querySelector(".modal-body input[id='title']");
        modalCourse = exampleModal.querySelector(".modal-body input[id='course']");
        modalCategory = exampleModal.querySelector(".modal-body select[id='category']");
        modalDate = exampleModal.querySelector(".modal-body input[id='date']");
        modalDescription = exampleModal.querySelector(".modal-body textarea[id='description']");

        // If category is miscellaneous then disable course input field
        modalCategory.addEventListener("change", () => {
            if (modalCategory.value == "Miscellaneous") {
                modalCourse.disabled = true;
                modalCourse.value = "";
            } else {
                modalCourse.disabled = false;
            }
        })

        // If the recipient is "Add Task", reset the form fields to empty and add listener on submit
        if (recipient == "Add Task") {
            modalTitle.value = "";
            modalCourse.value = "";
            modalCourse.disabled = false;
            modalCategory.value = "Assignment";
            modalDate.value = "";
            modalDescription.value = "";
            form.addEventListener('submit', writeTasks);
        }

        // Set the modal title to match the recipient (e.g., "Add Task")
        const modalTitleContent = exampleModal.querySelector('.modal-title');
        modalTitleContent.textContent = recipient;
    })
    // Clear event listener to avoid adding and editing happening from one submit
    exampleModal.addEventListener('hide.bs.modal', () => {
        form.removeEventListener('submit', writeTasks);
    })
}

// Function to get and display tasks from Firestore in real-time
function getTasks() {
    // Check if the user is authenticated
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            currentUser = db.collection("users").doc(user.id);

            // Query the user's tasks collection, ordered by due date
            db.collection("users").doc(user.uid)
                .collection("tasks")
                .orderBy("duedate")
                .onSnapshot((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        // If task list is filled then hide no task message
                        document.getElementById('notask').style.display = "none";
                    } else {
                        // If task list is empty then display no task message
                        document.getElementById('notask').style.display = "block";
                    }
                    // Clear the task list before re-rendering
                    document.getElementById('mytasks-go-here').innerHTML = "";

                    // Loop through the updated task documents
                    querySnapshot.forEach((doc) => {
                        // Call the function to display each task
                        displayMytaskCard(doc);
                    });
                });
        } else {
            console.log("No user logged in");
        }
    });
}

var count = 1;

// Function to display a task card in the UI
function displayMytaskCard(doc) {
    var name = doc.data().name;
    var category = "Category: " + doc.data().category;
    var desc;
    if (doc.data().description) {
        desc = "Description: " + doc.data().description;
    } else {
        desc = "";
    }
    var course;
    if (doc.data().course) {
        course = "Course: " + doc.data().course + "<br>"
    } else {
        course = "";
    }

    // Convert 24-hour due date from Firestore to 12-hour format 
    let due = new Date(doc.data().duedate);
    let timeString = due.toLocaleString('en-US');
    var dueDisplay = "Due date: " + timeString;
    let today = new Date();

    // Current time (Unix)
    const currentUnixTime = Math.floor(Date.now() / 1000);

    // Calculates due date and time (Unix)
    const dueUnixTime = Math.floor(due.getTime() / 1000);
    const secondsInDay = 86400;

    // Calculates the difference in seconds
    const timeDifference = dueUnixTime - currentUnixTime;

    const daysUntilDue = Math.floor(timeDifference / secondsInDay);

    // The approximate number of days in a year and month
    const daysInYear = 365.25;
    const daysInMonth = 30.44;

    // Calculates the number of months until a task is due. Uses math rounding rules
    // (e.g. if a task is due in 50 days, should display "2" for months)
    const monthsUntilDue = Math.round((daysUntilDue % daysInYear) / daysInMonth);

    // Calculates the number of years until a task is due. Uses math rounding rules
    // (e.g. if a task is due in 20 months, should display "2" for years)
    const yearsUntilDue = Math.round(daysUntilDue / daysInYear);

    // Determines status of task (complete or incomplete)
    var status = doc.data().status ? "Open" : "Close";

    // Accordion button definition
    let accordianBtn = document.getElementById("toggleBtn");
    if (accordianBtn) {
        accordianBtn.setAttribute("aria-controls", "collapse" + count);
        accordianBtn.setAttribute("data-bs-target", "#collapse" + count);
        accordianBtn.removeAttribute("id");
    }

    let collapseID = document.getElementById("collapseOne");
    if (collapseID) {
        collapseID.id = "collapse" + count++;
    }

    // Due date pill badge color definition
    let pillBadgeColor;
    // If more than 3 days out, display pill as green
    if ((daysUntilDue >= 3 && monthsUntilDue == 0 && yearsUntilDue == 0) || (monthsUntilDue > 0 && yearsUntilDue >= 0) || (yearsUntilDue > 0)) {
        pillBadgeColor = "text-bg-success";
        // If between 0 and 3 days out, display pill as yellow
    } else if (daysUntilDue >= 0 && daysUntilDue < 3 && monthsUntilDue == 0 && yearsUntilDue == 0) {
        pillBadgeColor = "text-bg-warning";
        // If overdue, display pill as red
    } else if (daysUntilDue < 0 || monthsUntilDue < 0 || yearsUntilDue < 0) {
        pillBadgeColor = "text-bg-danger";
        // FOR DEBUGGING PURPOSES: if none of the above are met (which should never happen), display pill as blue
    } else {
        pillBadgeColor = "bg-primary";
    }
    // If due today, display pill as yellow with a red border
    if (daysUntilDue == 0 && monthsUntilDue == 0 && yearsUntilDue == 0) {
        pillBadgeColor += " border border-danger border-5";
    }

    // Calculate dueText based on whether the task is overdue, due today, or due in the future
    let dueText;
    if (daysUntilDue === 0) {
        // Case where task is due today
        dueText = "Due today!";
    } else if (daysUntilDue > 0) {
        // Case where task is not due yet
        if (Math.abs(yearsUntilDue) <= 1 && daysUntilDue < daysInYear) {
            if (Math.abs(monthsUntilDue) <= 1 && daysUntilDue < daysInMonth) {
                // Show days
                dueText = daysUntilDue + (daysUntilDue === 1 ? " day until due" : " days until due");
            } else {
                // Show months
                dueText = monthsUntilDue + (monthsUntilDue === 1 ? " month until due" : " months until due");
            }
        } else {
            // Show years
            dueText = yearsUntilDue + (yearsUntilDue === 1 ? " year until due" : " years until due");
        }
    } else {
        // Case where task is overdue
        if (daysUntilDue > -daysInYear) {
            if (daysUntilDue > -daysInMonth) {
                // Show days overdue
                dueText = Math.abs(daysUntilDue) + (Math.abs(daysUntilDue) === 1 ? " day overdue" : " days overdue");
            } else {
                // Show months overdue
                dueText = Math.abs(monthsUntilDue) + (Math.abs(monthsUntilDue) === 1 ? " month overdue" : " months overdue");
            }
        } else {
            // Show years overdue
            dueText = Math.abs(yearsUntilDue) + (Math.abs(yearsUntilDue) === 1 ? " year overdue" : " years overdue");
        }
    }

    // Colour coding task cards based on category (DANIEL WILL TRY THIS LATER)

    // Clone the task card template and populate it with the task data
    let newcard = document.getElementById("taskCardTemplate").content.cloneNode(true);

    // Task pill badge definition
    let pillBadgeElement = name + "<span id=\"badge\" class=\"badge rounded-pill card-due fs-5 mx-4 position-absolute " + pillBadgeColor + "\">" + daysUntilDue + " days</span>";
    newcard.querySelector('.card-name').innerHTML = pillBadgeElement;
    newcard.querySelector('.card-due').innerHTML = dueText;
    newcard.querySelector('.card-course').innerHTML = course + category + "<br>" + dueDisplay + "<br>" + desc;

    // Add edit button and event listener to each card 

    let editButton = newcard.querySelector('#editTask');
    editButton.addEventListener('click', function () {
        // Pass the entire document snapshot to the editTask function
        editTasks(doc.id);
    });

    // Add delete button and event listener to each card
    let deleteButton = newcard.querySelector('#deleteTask');
    deleteButton.addEventListener('click', function () {
        // Pass the task ID to delete the task
        deleteTask(doc.id, true);
    });

    // Complete button and event listener to each card
    let completeButton = newcard.querySelector('#completeTask');
    completeButton.addEventListener('click', function () {
        // Pass the task ID to complete the task
        completeTask(doc.id, false);
        swal("Good job!", "Task successfully completed!", "success");
    });

    // Append the new card to the tasks container
    document.getElementById("mytasks-go-here").append(newcard);
}

// Function to delete a task from Firestore
function deleteTask(taskId, flag) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var taskRef = db.collection("users").doc(user.uid).collection("tasks").doc(taskId);
            if (flag) {
                // SweetAlert for task deletion
                swal("Are you sure?", {
                    dangerMode: true,
                    buttons: true,
                }).then((value) => {
                    if (value) {
                        taskRef.delete().then(() => {
                            getTasks();
                        }).catch((error) => {
                            console.error("Error deleting task: ", error);
                        });
                    } else {
                        console.log("User changed their mind on deleting task");
                    }
                });
            } else {
                taskRef.delete().then(() => {
                    getTasks();
                });
            }
        }
    })
}

// Function to handle completing a task
function completeTask(taskId) {
    deleteTask(taskId);
    // Check if the user is authenticated
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Get a reference to the specific user
            var userComp = db.collection("users").doc(user.uid);

            // Get the "completed" field from Firestore and increase by 1
            userComp.get().then(userDoc => {
                var completedTask = userDoc.data().completed;
                completedTask++;
                // Update the "completed" field 
                userComp.update({
                    completed: completedTask
                }).then(() => {
                    document.getElementById("counter-value").innerText = completedTask;
                })
            })
        } else {
            console.log("No user is signed in");
        }
    });
}

// Function to writing tasks data to Firestore
function writeTasks(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Check if the user is authenticated
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Get a reference to the tasks collection in Firestore
            var tasksRef = db.collection("users").doc(user.uid).collection("tasks");

            // Get the values entered by the user in the modal
            var taskName = document.getElementById('title').value;
            var taskCourse = document.getElementById('course').value;
            var taskCategory = document.getElementById('category').value;
            var taskDescription = document.getElementById('description').value;
            var taskdueDate = document.getElementById('date').value;

            // Add the task in Firestore
            tasksRef.add({
                name: taskName,
                course: taskCourse,
                category: taskCategory,
                description: taskDescription,
                duedate: taskdueDate
            }).then(() => {
                // Hide the modal after submission
                var myModalEl = document.getElementById('exampleModal');
                var modal = bootstrap.Modal.getInstance(myModalEl);
                modal.hide();
                getTasks();
            }).catch((error) => {
                console.error("Error updating task: ", error);
            });
        } else {
            console.log("No user is signed in");
        }
    });
}

// Function to handle editing task
function editTasks(taskId) {
    // Check if the user is authenticated
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Get a reference to the specific task that needs to be updated
            var taskRef = db.collection("users").doc(user.uid).collection("tasks").doc(taskId);
            taskRef.get().then(userDoc => {
                // Update modal fields according to the specific task properties
                modalTitle.value = userDoc.data().name;
                modalCourse.value = userDoc.data().course;
                modalCategory.value = userDoc.data().category;
                modalDescription.value = userDoc.data().description;
                modalDate.value = userDoc.data().duedate;
            })

            // Add listener for submission when editing task 
            form.addEventListener('submit', function updateTask(event) {
                // Prevent page refresh
                event.preventDefault();
                // Update Firestore values according to modal inputs
                taskRef.update({
                    name: modalTitle.value,
                    category: modalCategory.value,
                    course: modalCourse.value,
                    description: modalDescription.value,
                    duedate: modalDate.value
                }).then(() => {
                    // Remove edit submit to prevent triggering with add submit 
                    form.removeEventListener('submit', updateTask);
                    // SweetAlert for task edit
                    swal("Great edit!", "Task successfully edited!", "info");
                    // Hide the modal after submission
                    var myModalEl = document.getElementById('exampleModal');
                    var modal = bootstrap.Modal.getInstance(myModalEl);
                    modal.hide();
                    getTasks();
                })
            })
        } else {
            console.log("No user is signed in");
        }
    });
}

// Insert name function using the global variable "currentUser"
function insertInfoFromFirestore() {
    currentUser.get().then(userDoc => {
        //Get the user name
        var user_Name = userDoc.data().name;
        var counter = userDoc.data().completed;
        document.getElementById("name-goes-here").innerText = "Welcome " + user_Name + "!";
        document.getElementById("counter-value").innerText = counter;
    })
}