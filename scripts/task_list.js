// Function to read the quote of the day from the Firestore "quotes" collection
// Input param is the String representing the day of the week, aka, the document name
function readTaskName(task) {
    db.collection("tasks").doc(task)                                                         //name of the collection and documents should matach excatly with what you have in Firestore
        .onSnapshot(taskDoc => {                                                              //arrow notation
            console.log("current document data: " + taskDoc.data());                          //.data() returns data object
            document.getElementById("task-name-goes-here").innerHTML = taskDoc.data().name;      //using javascript to display the data on the right place
            document.getElementById("due-date-goes-here").innerHTML = taskDoc.data().due; 
            document.getElementById("description-goes-here").innerHTML = taskDoc.data().description; 
            document.getElementById("course-goes-here").innerHTML = taskDoc.data().course; 
            //Here are other ways to access key-value data fields
            //$('#quote-goes-here').text(dayDoc.data().quote);         //using jquery object dot notation
            //$("#quote-goes-here").text(dayDoc.data()["quote"]);      //using json object indexing
            //document.querySelector("#quote-goes-here").innerHTML = dayDoc.data().quote;

        }, (error) => {
            console.log ("Error calling onSnapshot", error);
        });
    }
 readTaskName("task1");        //calling the function

 //------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("cardTemplate"); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable. 
    
    db.collection(collection).get()   //the collection called "hikes"
        .then(allTasks=> {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allTasks.forEach(doc => { //iterate thru each doc
                var title = doc.data().name;       // get value of the "name" key
                var description = doc.data().description;  // get value of the "details" key
				var course = doc.data().course;   
                //				var hikeCode = doc.data().code;    //get unique ID to each hike to be used for fetching right image
                //var length = doc.data().hikeLength; //gets the length field
              // var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
                
                //update title and text and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-due').innerHTML = 3 +" days";
                newcard.querySelector('.card-text').innerHTML = description;
                newcard.querySelector('.card-course').innerHTML = course;
                //newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg
                // newcard.querySelector('a').href = "eachHike.html?docID="+docID;

                //Optional: give unique ids to all elements for future use
                // newcard.querySelector('.card-title').setAttribute("id", "ctitle" + i);
                // newcard.querySelector('.card-text').setAttribute("id", "ctext" + i);
                // newcard.querySelector('.card-image').setAttribute("id", "cimage" + i);

                //attach to gallery, Example: "hikes-go-here"
                document.getElementById(collection + "-go-here").appendChild(newcard);

                //i++;   //Optional: iterate variable to serve as unique ID
            })
        })
}

displayCardsDynamically("hikes");  //input param is the name of the collection

// Dynamically change modals based on which button is pressed 
const exampleModal = document.getElementById('exampleModal');
if (exampleModal) {
  exampleModal.addEventListener('show.bs.modal', event => {
    // Button that triggered the modal
    const button = event.relatedTarget
    // Extract info from data-bs-* attributes
    const recipient = button.getAttribute('data-bs-whatever')
    const modalTitle = exampleModal.querySelector(".modal-body input[id='title']");
    const modalDate = exampleModal.querySelector(".modal-body input[id='date']");
    const modalDescription = exampleModal.querySelector(".modal-body textarea[id='description']");
    // If necessary, you could initiate an Ajax request here
    // and then do the updating in a callback.
    if (recipient == "Add Task") {
        modalTitle.value = "";
        modalDate.value = "";
        modalDescription.value = "";
    }
    /*
    if (recipient == "Edit Task") {
        modalTitle.value = document.getElementById('task-name-goes-here').innerHTML;
        modalDate.value = document.getElementById('due-date-goes-here').innerHTML;
        modalDescription.value = document.getElementById('description-goes-here').innerHTML;
    }*/
    // Update the modal's content.
    const modalTitleContent = exampleModal.querySelector('.modal-title');
    modalTitleContent.textContent = recipient;
  })
}
displayCardsDynamically("tasks");  //input param is the name of the collection

document.querySelector("#addTask").addEventListener("click", function (e) {
    //console.log(e);
    var title = document.getElementById("title").value;

    var  tasksRef = db.collection("tasks");

    tasksRef.add({
        name: title
    })
});