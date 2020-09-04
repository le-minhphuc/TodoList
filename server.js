const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("build"));
app.use(express.json()); // auto JSON.parse the req.body
let listItems = [];

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'todolist';
const mongoClient = new MongoClient(url);
let db;
let collection;

app.get('/initial', (req, res) => {
    console.log("GET request");
    collection.find({}).toArray(function(err, result) {
        if (err) console.log(err);
        console.log(result);
        listItems = [];
        for (let item of result) {
            listItems.push({itemId: item._id, itemContent: item.toAdd});
        }
        res.json(result);
    });
})

app.post('/', (req, res) => {
    console.log("POST request");
    // console.log(`id to add is ${req.body._id}`);
    collection.insertOne(req.body, (err, result) => {
        if (err) {
            console.log("Error during insertion " + err);
            res.send("Failed to insert into DB");
        } else {
            console.log("Insertion succeeds");
            listItems.push({itemId: result.insertedId, itemContent: req.body.toAdd});
            // for (let item of listItems) {
            //     console.log(item);
            // }
            res.send("Insertion succeeds");
        }
    })
    // console.log(`listItems are ${listItems.join(" | ")}`);
    collection.find({}).toArray(function(err, result) {
        if (err) console.log(err);
        console.log(result);
    });
});

app.put('/', (req, res) => {
    console.log("PUT request");
    let updateId = req.body.itemToUpdateId;
    let updateContent = req.body.itemToUpdateContent;
    
    const newListItems = listItems.map(singleItem => singleItem.itemId === parseInt(updateId)
        ? {...singleItem, itemContent: updateContent}
        : singleItem);

    listItems = newListItems;
    // for (let item of listItems) {
    //     console.log(item);
    // }

    collection.updateOne({_id : {$eq: parseInt(updateId)}}, {$set: {toAdd: req.body.itemToUpdateContent}}, (err, result) => {
        if (err) {
            console.log("Error during update " + err);
            res.send("Failed to update from DB");
        } else {
            console.log("Update succeeds");
            res.send("Update succeeds");
        }
    })
    collection.find({}).toArray(function(err, result) {
        if (err) console.log(err);
        console.log(result);
    });
})

app.delete('/', (req, res) => {
    console.log("DELETE request");
    if (req.body.itemToDelete === "Whole list") {
        listItems = [];
        console.log(`listItems are ${listItems.join(" | ")}`);
        collection.deleteMany({}, (err, result) => {
            if (err) {
                console.log("Error during deletion " + err);
                res.send("Failed to delete from DB");
            } else {
                console.log("Deletion succeeds");
                res.send("Deletion succeeds");
            }
        })
    } else {
        listItems = listItems.filter(singleItem => {
            return singleItem.itemId !== (req.body.itemToDelete);
        })
        // for (let item of listItems) {
        //     console.log(item);
        // }
        let deleteId = req.body.itemToDelete;
        collection.deleteOne({_id: parseInt(deleteId)}, (err, result) => {
            if (err) {
                console.log("Error during deletion " + err);
                res.send("Failed to delete from DB");
            } else {
                console.log("Deletion succeeds");
                res.send("Deletion succeeds");
            }
        })
        collection.find({}).toArray(function(err, result) {
            if (err) console.log(err);
            console.log(result);
        });
    }  
})

/* mongoClient.connect((err) => {
    if (err) {
        mongoClient.close();
    } else {
        db = mongoClient.db(dbName);
        app.listen(port, (err) => {
            if (err) {
                console.log("Node server cannot start: " + err);
            } else {
                console.log(`server ready on http://localhost:${port}`);
            }
        });
        console.log("The app is still alive");
        mongoClient.close();
    }
}) */

app.listen(port, err => {
    if (err) console.log(err);
    else {
        console.log(`server ready on http://localhost:${port}`);
        mongoClient.connect(err => {
            if (err) {
                console.log("Cannot connect to mongoDB server!");
                res.send("Failure to connect to DB");
            } else {
                db = mongoClient.db(dbName);
                collection = db.collection('test');
                // collection.find({}).toArray(function(err, result) {
                //     if (err) console.log(err);
                //     console.log(result);
                // });
            }
        })
    }
});