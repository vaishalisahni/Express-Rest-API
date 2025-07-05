const express = require('express');
const users = require('./MOCK_DATA.json');
const fs = require('fs');

const port = 8000;
const app = express();

// middleware - plugins
app.use(express.urlencoded({ extended: false })); // to parse form data

// Custom Middleware - middleware to maintain logs
app.use((req, res, next) => {
    fs.appendFile('./logs.txt', `\n${new Date().toISOString()}: ${req.ip} ${req.method} ${req.path} `, (err,data) => {
        next(); // call next middleware
    });
});

app.use((req, res, next) => {
    const myUsername="Vaishali Sahni";
    console.log("hello from middleware 3");
    next();
});

app.use((req, res, next) => {
    console.log("i m in get route"+req.myUsername);
    next();
});

// ----------------Routes
// Server side rendering - HTML document render
app.get('/users', (req, res) => {
    const htmlContent = `
   
           <ul>
               ${users.map(user => `<li>${user.first_name} ${user.last_name}</li>`).join('')}
           </ul>
       
   `;
    return res.send(htmlContent);
});

// Rest API
// API endpoint to list all users in JSON format - for frontend/mobile app, alexa
app.get('/api/users', (req, res) => {
    // -----> Http Headers <-----
    console.log(req.headers); // reading headers from the request
    res.setHeader("X-myName", "Vaishali Sahni"); //custom header ---> Always add X to custom headers
    return res.json(users);
});

// app.get('/api/users/:id',(req,res)=>{

//     const id= Number(req.params.id);
//     const user= users.find(user=>user.id===id);

//     return res.json(user);
// });

app.post('/api/users', (req, res) => {
    const body = req.body;
    // console.log(body); // to see the data sent from the frontend

    users.push({ id: users.length + 1, ...body });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        return res.json({ status: 'success', id: users.length });
    });

});

// app.patch('/api/users/:id',(req,res)=>{
//     // TOdo : update an existing user
//     return res.json({status:'pending'})
// });

// app.delete('/api/users/:id',(req,res)=>{
//     // TOdo : delete an existing user
//     return res.json({status:'pending'})
// });

// ---------------- Notes ----------
// Above coommented code - get , patch, delete - have same route .. so we can combine them using app.route
// app.route('/api/users/:id') - this will create a chain of methods for the same route
// This is a better way to handle multiple methods for the same route -n in future if we want to edit the route we dont have to edit everywhere individually
app.route('/api/users/:id')
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find(user => user.id === id);
        return res.json(user);
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        
        const userIndex = users.findIndex(user => user.id === id);
       
        const updatedUser = { ...users[userIndex], ...req.body };
        users[userIndex] = updatedUser;
        // console.log(users[userIndex]);
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
            return res.json({ status: 'success', id: users.length });
        });
    })
    .delete((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex(user => user.id === id);

        users.splice(userIndex, 1);
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data)=>{
            return res.json({ status: 'success', id: users.length });
        });
    });

// -------------------Server listening/using 
app.listen(port, () => {
    console.log(`server is running on port ${port}!`);
});
