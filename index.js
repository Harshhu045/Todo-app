const express = require("express")
const jwt = require("jsonwebtoken")
const path = require("path")
const cors = require('cors');
const { z } = require("zod");


const app = express();
app.use(express.json());
app.use(cors());

const users = []
const todos = []

const  JWT_SECRET="harsh_upadhyay"

app.use(express.static(path.join(__dirname, "public")));

app.post("/signup",(req, res)=>{

    const requirebody = z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string()
            .min(8, "Password must be at least 8 characters long")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[!@#$%^&*()_+-=~[]{}|;:'",.<>]/, "Password must contain atleast one special character")
    });



    try{
        const { username, password} = requirebody.parse(req.body);


        if(users.find((user) => user.username===username)){
            return res.json({
                message: "You are already signed up"
            })
        }

        users.push({ username, password})

        res.json({ message : "you are succesfully signed up!"});

    }catch(err){
        if (err instanceof z.ZodError) {
            // Extract error messages from Zod validation
            const errorMessages = err.errors.map(error => error.message);

            // Send the error messages back to the frontend
            return res.status(400).json({ message: errorMessages });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
})

app.post("/signin", (req, res)=>{
    const{ username, password }=req.body;

    if( !username || !password){
        return res.json({
            message: " Username and password are required."
        })
    }

    const founduser=users.find((user) => user.username===username && user.password===password);

    if(founduser){
        const token = jwt.sign({ username}, JWT_SECRET);

        res.json({
            token: token,
            message: "You are succesfully signed in!"
        })
    }
    else{
        res.json({
            message: "Invalid username and Password"
        })
    }
})

    // Middleware function to authenticate a user

    function auth(req, res, next) {
        const token = req.headers.authorization;

        if(!token){
            res.json({
                message: "Token is missing"
            })
        }

        try{
            const decodedData=jwt.verify(token, JWT_SECRET);

            req.username = decodedData.username;

            next()
        }
        catch(error)
        {
            res.json({ message: "Invalid token!" });
        }
    }

// to get alll the todos from the enetered username
    app.get("/todos", auth, (req, res)=>{
        const currentUser = req.username;

        const userTodos = todos.filter((todo) => todo.username===currentUser);

        res.json(userTodos);
    })

    // To create a new todo
    app.post("/todos", auth, (req, res)=>{
        const {title}=req.body;
        const currentUser = req.username;

        if(!title){
            return res.json({
                message: "To-do title canot be empty"
            })
        }

        const newTodo = {
            id: todos.length + 1,
            username: currentUser,
            title,
            done: false
        }

        todos.push(newTodo);

        res.json({ message: "To-do added succesfully!", todo: newTodo});
    })

    // To update a todo by given Id
    app.put("/todos/:id", auth, (req, res)=>{
        const{id}=req.params

        const{title}=req.body;

        const currentUser=req.username;

        const todo = todos.find((todo)=> todo.id === parseInt(id) && todo.username===currentUser);

        if(!todo){
            return res.json({
                message : "To-do Not Found"
            })
        }

        if(!title){
            return res.json({ message : "To-do title can not be empty"})
        }

        todo.title = title;

        res.json({ message : "To-do updated succesfully"})
    })

    // To delete a todo  by given Id 
    app.delete("/todos/:id", auth, (req, res)=>{
        const {id} = req.params

        const currentUser = req.username

        const todoIndex = todos.filter((todo)=> todo.id === parseInt(id) && todo.username === currentUser);

        if(todoIndex===-1){
            return res.json({message: "To-do Not found"})
        }

        todos.splice(todoIndex,1);

        res.json({message : "To-do deleted succesfully!"});
    })

    // Route to mark a todo as done/undone using PUT
    app.put("/todos/:id", auth,(req, res)=>{
        const{id}=req.params;
        const currentUser=req.username;

        const todo = todos.filter((todo)=> todo.id===parseInt(id) && todo.username === currentUser);

        if(!todo){
            return res.json("To-do Not found!")
        }

        todo.done=!todo.done;

        res.json({ message: `To-do marked as ${todo.done ? "done" : "undone"}.`,todo});
    })


app.listen(3000)