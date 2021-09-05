const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((u)=> u.username === username);

  if( !user) {
    return response.status(404).json({ error: "User not found" });
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {

  const {name, username} = request.body;
  
  const userExists = users.find((u)=> u.username === username);

  if( userExists) {
    return response.status(400).json({ error: "User Already Exists" });
  }


  const id =  uuidv4();
  const user = {
    id,
    name,
    username,
    todos:[]
  }
  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  //const user = users.find((u) => u.username === username);
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),    
  }

  user.todos.push(todo);
  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const { title, deadline } = request.body;
  const {id} = request.params;
  const todo = user.todos.find((t) => t.id === id);  

  if( !todo) {
    return response.status(404).json({error: "Todos not found" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
  /* const todos = user.todos
                .filter((t) => t.id=== id)
                .map((todo) => ({...todo, title, deadline: new Date(deadline)}));
 */

 
  
}
);

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const { title, deadline } = request.body;
  const {id} = request.params;
  const todo = user.todos.find((t) => t.id === id);  

  if( !todo) {
    return response.status(404).json({error: "Todos not found" });
  }
  todo.done = true; 

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;    
  const {id} = request.params;
        /*
          const user = users.find((u) => username === username);  
          const todos = user.todos
                .filter((t) => t.id=== id)
                .slice(t,1); 
          user.todos = todos;
        */
  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  if ( todoIndex === -1){
    return response.status(404).json({ error: 'Todo Not Found' });
  }

  user.todos.splice(todoIndex, 1);
  
  return response.status(204).json(user);
});

module.exports = app;