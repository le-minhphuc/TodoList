// this will be where the server handles CRUD requests
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("build"));
app.use(express.json()); // auto JSON.parse the req.body
let listItems = [];
// let count = 0;

app.post('/', (req, res) => {
    console.log("POST request");
    listItems.push([req.body.itemId, req.body.toAdd]);
    console.log(`listItems are ${listItems.join(" | ")}`);
    res.json(req.body.toAdd);
});

app.put('/', (req, res) => {
    console.log("PUT request");
    let updateId = parseInt(req.body.itemToUpdateId);
    let updateContent = req.body.itemToUpdateContent;
    let index = listItems.findIndex(item => item[0] === updateId);
    listItems[index] = [updateId, updateContent];
    console.log(`listItems are ${listItems.join(" | ")}`);
    res.json(updateContent);
})

app.delete('/', (req, res) => {
    console.log("DELETE request");
    if (req.body.itemToDelete === "Whole list") {
        listItems = [];
    } else {
        listItems = listItems.filter(singleItem => {
            return singleItem[0] !== parseInt(req.body.itemToDelete);
        })
    }
    console.log(`listItems are ${listItems.join(" | ")}`);
    res.json(req.body.itemToDelete);
})

app.listen(port, err => {
    if (err) throw err;
    else {
        console.log(`server ready on http://localhost:${port}`);
    }
});