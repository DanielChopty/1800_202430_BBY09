// Listens to submit button for adding task
var form = document.getElementById("formId");
form.addEventListener('submit', writeTasks);

// Dynamically change modals based on which button is pressed 
const exampleModal = document.getElementById('exampleModal');
if (exampleModal) {
    exampleModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget;
        // Extract info from data-bs-* attributes
        const recipient = button.getAttribute('data-bs-whatever');
        const modalTitle = exampleModal.querySelector(".modal-body input[id='title']");
        const modalCourse = exampleModal.querySelector(".modal-body input[id='course']");
        const modalCategory = exampleModal.querySelector(".modal-body select[id='category']");
        const modalDate = exampleModal.querySelector(".modal-body input[id='date']");
        const modalDescription = exampleModal.querySelector(".modal-body textarea[id='description']");
        // If necessary, you could initiate an Ajax request here
        // and then do the updating in a callback.
        if (recipient == "Add Task") {
            modalTitle.value = "";
            modalCourse.value = "";
            modalCategory.value = "assignments";
            modalDate.value = "";
            modalDescription.value = "";
        }
        // Update the modal's content.
        const modalTitleContent = exampleModal.querySelector('.modal-title');
        modalTitleContent.textContent = recipient;
    });
}

// Takes all values from add task modal and stores it in firestore
function writeTasks(event) {
    event.preventDefault();
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            var tasksRef = db.collection("users").doc(user.uid).collection("tasks");
            var taskName = document.getElementById('title').value;
            var taskCategory = document.getElementById('category').value;
            var taskDescription = document.getElementById('description').value;
            var taskdueDate = document.getElementById('date').value;
            tasksRef.add({
                name: taskName,
                category: taskCategory,
                description: taskDescription,
                duedate: taskdueDate,
                status: false
            });
            console.log("Task added!");
            var myModalEl = document.getElementById('exampleModal');
            var modal = bootstrap.Modal.getInstance(myModalEl);
            modal.hide();
        } else {
            console.log("No user is signed in");
        }
    });
    document.getElementById('mytasks-go-here').innerHTML = "";
    getTasks();
}

// Reads tasks data from firestore
function getTasks() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(user.uid);
            db.collection("users").doc(user.uid)
                .collection("tasks") // subcollection
                .orderBy("duedate")
                .get()
                .then(doclist => {
                    doclist.forEach(doc => {
                        currentTask = doc;
                        console.log(currentTask);   //unpack and see all the attributes
                        displayMytaskCard(currentTask);
                    });
                });
        } else {
            console.log("No user logged in");
        }
    });
}
getTasks();

var count = 1;

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayMytaskCard(doc) {
    var name = doc.data().name;
    var desc = doc.data().description;
    let due = new Date(doc.data().duedate);
    let category = doc.data().category;
    let status = doc.data().status ? "Open" : "Closed";
    var taskId = doc.id; // The task's Firestore ID
    // Add task data to the task card template
    let newcard = document.getElementById("taskCardTemplate").content.cloneNode(true);
    newcard.querySelector('.card-name').innerHTML = name;
    newcard.querySelector('.card-description').innerHTML = desc;
    newcard.querySelector('.card-due').innerHTML = due.toLocaleDateString(); // Format the due date
    // Find the delete button and add a click event listener
    const deleteButton = newcard.querySelector('.btn-danger');
    deleteButton.addEventListener('click', function () {
        showDeleteModal(taskId); // Show the delete modal and pass the task ID
    });

    // Append the new card to the container
    document.getElementById("mytasks-go-here").append(newcard);
}

// Function to show the delete modal and pass the task ID
function showDeleteModal(taskId) {
    // Store the taskId in a global variable or a modal data attribute
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Update the modal to indicate it's deleting the selected task
    const deleteButton = document.querySelector('#deleteModal .btn-danger');
    deleteButton.onclick = function () {
        deleteTask(taskId); // Call deleteTask with the selected task ID
    };

    deleteModal.show();
}

// Changing the attributes of the button so that it only closes one and not all
let accordianBtn = document.getElementById("toggleBtn");
if (accordianBtn) {
    accordianBtn.setAttribute("aria-controls", "collapse" + count);
    accordianBtn.setAttribute("data-bs-target", "#collapse" + count);
    accordianBtn.removeAttribute("id");
}

// https://www.geeksforgeeks.org/how-to-change-the-id-of-element-using-javascript/
let collapseID = document.getElementById("collapseOne");
console.log(collapseID);
if (collapseID) {
    collapseID.id = "collapse" + count++;
}

// Badge color logic for due date
let pillBadgeColor;
if (daysUntilDue > 3 && monthsUntilDue == 0 && yearsUntilDue == 0) {
    pillBadgeColor = "text-bg-success";
} else if (daysUntilDue >= 0 && daysUntilDue < 3 && monthsUntilDue == 0 && yearsUntilDue == 0) {
    pillBadgeColor = "text-bg-warning";
} else if (daysUntilDue < 0 && monthsUntilDue == 0 && yearsUntilDue == 0) {
    pillBadgeColor = "text-bg-danger";
} else {
    pillBadgeColor = "bg-success";
}

if (daysUntilDue == 0 && monthsUntilDue == 0 && yearsUntilDue == 0) {
    pillBadgeColor += " border border-danger border-5";
}

let pillBadgeElement = name + "<span class=\"badge rounded-pill card-due fs-5 mx-4 mt-auto mb-auto " + pillBadgeColor + "\">14</span>";

let dueText;

if (Math.abs(yearsUntilDue) < 1) {
    if (Math.abs(monthsUntilDue) < 1) {
        if (daysUntilDue > 0) {
            dueText = daysUntilDue + (daysUntilDue == 1 ? " day out" : " days out");
        } else if (daysUntilDue < 0) {
            dueText = -daysUntilDue + (daysUntilDue == -1 ? " day late" : " days late");
        } else {
            dueText = "Due today!";
        }
    } else {
        if (monthsUntilDue >= 0) {
            dueText = monthsUntilDue + (monthsUntilDue == 1 ? " month out" : " months out");
        } else {
            dueText = -monthsUntilDue + (monthsUntilDue == -1 ? " month late" : " months late");
        }
    }
} else {
    if (yearsUntilDue >= 0) {
        dueText = yearsUntilDue + (yearsUntilDue == 1 ? " year out" : " years out");
    } else {
        dueText = -yearsUntilDue + (yearsUntilDue == -1 ? " year late" : " years late");
    }
}

// Clone the new card and populate with title, image
let newcard = document.getElementById("taskCardTemplate").content.cloneNode(true);
newcard.querySelector('.card-name').innerHTML = pillBadgeElement;
newcard.querySelector('.card-description').innerHTML = desc;
newcard.querySelector('.card-due').innerHTML = dueText;

// Append to the posts
document.getElementById("mytasks-go-here").append(newcard);
}