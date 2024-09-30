// navigate fun() to switch btw signup and signin

function moveToSignup(){
    document.getElementById("signup-container").style.display="block"
    document.getElementById("signin-container").style.display="none"
    document.getElementById("todos-container").style.display="none"
}

function moveToSignin(){
    document.getElementById("signup-container").style.display="none"
    document.getElementById("signin-container").style.display="block"
    document.getElementById("todos-container").style.display="none"
}

// function showtodo app

function showTodoApp(){
    document.getElementById("signup-container").style.display="none"
    document.getElementById("signin-container").style.display="none"
    document.getElementById("todos-container").style.display="block"
    getTodos()
}

// function to handle sign up and sign in user

async function signup() {
    // event.preventDefault();
    
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    try{
        const response = await axios.post("http://localhost:3000/signup",{
            username,
            password
        })

        // Log the response for debugging
        console.log("Server response:", response.data);

        alert(response.data.message);

        // Display the message in the div
        const messageDiv = document.getElementById("message");
        messageDiv.textContent = response.data.message;
        messageDiv.style.color = response.data.message === "You are already signed up" ? 'red' : 'green';

        if(response.data.message==="you are signedup suceesfully"){
            moveToSignin();
        }
        else{
            document.getElementById("message").textContent = response.data.message;
        }
    }catch(error){
        console.error("Error while sign up",error);

        // Check if it's a validation error
        if (error.response && error.response.status === 400) {
            const messageDiv = document.getElementById('message');
            const errorMessages = error.response.data.message;

            // Display the error messages in the div
            messageDiv.innerHTML = errorMessages.map(msg => `<p style="color: yellow;">${msg}</p>`).join('');
        } else {
            // Handle other errors (e.g., network issues)
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = "Something went wrong. Please try again.";
            messageDiv.style.color = 'yellow';
        }
    }
}

document.getElementById("signup-container").addEventListener('submit', signup);

async function signin() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    try{
        const response = await axios.post("http://localhost:3000/signin",{
            username,
            password
        })

        if(response.data.token){
            localStorage.setItem("token", response.data.token);
            alert(response.data.message)
            showTodoApp();
        }
        else{
            alert(response.data.message);
        }
    }catch(error){
        console.error("Error while Signin",error);
    }
}

// function to logout

async function logout() {
    localStorage.removeItem("token");
    alert("You are logged out succesfully!")
    moveToSignin();
}

// function to fetch and display todos

async function getTodos() {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:3000/todos",{
            headers: { Authorization: token},
        });

        const todosList = document.getElementById("todos-list");

        todosList.innerHTML = "";

        if(response.data.length){
            response.data.forEach((todo) => {
                const todoElement = createTodoElement(todo);
                todosList.appendChild(todoElement);
            });
        }
    } catch (error) {
        console.error("Error while getting To-do list:", error);
    }
}

// function to add a To-do

async function addTodo() {
    const inputElement = document.getElementById("input");
    const title = inputElement.value;

    if(title.trim()===""){
        alert("Please write something to add to the todos list.");
        return;
    }

    try{
        const token = localStorage.getItem("token");

        await axios.post("http://localhost:3000/todos",{title},{
            headers:{ Authorization: token},
        });

        inputElement.value="";

        getTodos();
    }catch(error){
        console.error("Error while adding a new todo item");
    }
}

// function to update a to-do

async function updateTodo(id, newtitle) {
    const token = localStorage.getItem("token");
    try{
        await axios.put(`http://localhost:3000/todos/${id}`,
        {title: newtitle},
        {
            headers: {Authorization: token},
        }
        );
        
        getTodos();
    }catch(error){
        console.error("Error while updating a todo item");
    }
}

// function to delete a todo
async function deleteTodo(id) {
    const token = localStorage.getItem("token");

    try{
        await axios.delete(`http://localhost:3000/todos/${id}`,{
            headers: {Authorization: token},
        })

        getTodos();
    }catch(error){
        console.error("Error while deleting  a To-do item: ",error);
    }
}

// function to mark down a todo as done/undone
async function toggoleTodoDone(id) {
    const token = localStorage.getItem("token");

    try{
        await axios.put(`http://localhost:3000/todos/${id}/done`,{
            headers: {Authorization: token},
        })

        getTodos();
    }catch(error){
        console.error("Error while toggling a todo status: ",error);   
    }

}

function createTodoElement(todo){
    // create a div name todo-item
    const todoDiv = document.createElement("div")
    todoDiv.className = "todo-item";

    // create a div contains input container inside todo-item
    const inputContainer = document.createElement("div")
    inputContainer.className = "input-container"

    // create a div contains  controls-container inside todo-item
    const controlsContainer = document.createElement("div")
    controlsContainer.className = "controls-container"

    // Create input element
    const inputElement = createInputElement(todo.title);
    inputElement.readOnly = true;

    // create the buttons and checkbox
    const updateBtn = createUpdateButton(inputElement, todo.id);
    const deleteBtn = createDeleteButton(todo.id);
    const doneCheckbox = createDoneCheckbox(todo.done, todo.id, inputElement)

    // inputElement inside input contaoiner
    inputContainer.appendChild(inputElement);

    // buttons and checkbox inside a controls conatainer
    controlsContainer.appendChild(doneCheckbox);
    controlsContainer.appendChild(updateBtn);
    controlsContainer.appendChild(deleteBtn);

    // input-container and controls-container inside the todo-div
    todoDiv.appendChild(inputContainer);
    todoDiv.appendChild(controlsContainer);

    return todoDiv;
}

function createInputElement(value){
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = value;
    inputElement.readOnly = true;

    return inputElement;
}

function createUpdateButton(inputElement, id) {
    // Create an update button
    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Edit";

    // Handle button click
    updateBtn.onclick = function () {
        if (inputElement.readOnly) {
            // Make input editable and change button text to "Save"
            inputElement.readOnly = false;
            updateBtn.textContent = "Save";
            inputElement.focus(); // Focus on the input field
            inputElement.style.outline = "1px solid #007BFF"; // Add blue focus color
        } else {
            // Make input read-only and change button text to "Edit"
            inputElement.readOnly = true;
            updateBtn.textContent = "Edit";
            inputElement.style.outline = "none"; // Remove focus outline
            // Update the To-Do with new title
            updateTodo(id, inputElement.value);
        }
    };

    return updateBtn;
}

// Create a delete button for a To-Do
function createDeleteButton(id) {
    // Create a delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    // Handle button click
    deleteBtn.onclick = function () {
        // Delete the To-Do
        deleteTodo(id);
    };

    return deleteBtn;
}

// Function to mark a To-Do as done/undone
async function toggleTodoDone(id, done) {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");

    try {
        // Send the updated status of the To-Do (done/undone) to the server
        await axios.put(
            `http://localhost:3000/todos/${id}/done`,
            { done: !done }, // Toggle the done state
            {
                headers: { Authorization: token },
            }
        );

        // Refresh the To-Do list to reflect the changes
        getTodos();
    } catch (error) {
        // Log error if toggling To-Do status fails
        console.error("Error while toggling To-Do status:", error);
    }
}

// Create a checkbox to mark a To-Do as done/undone
function createDoneCheckbox(done, id, inputElement) {
    // Create a checkbox element
    const doneCheckbox = document.createElement("input");
    doneCheckbox.type = "checkbox";
    doneCheckbox.checked = done;

    // Set the text decoration based on the current done state
    inputElement.style.textDecoration = done ? "line-through" : "none";

    // Handle checkbox change
    doneCheckbox.onchange = function () {
        // Toggle the To-Do status and update text decoration
        toggleTodoDone(id, done); // Pass the current done state
        inputElement.style.textDecoration = doneCheckbox.checked ? "line-through" : "none"; // Update text decoration based on checkbox state
    };

    return doneCheckbox;
}