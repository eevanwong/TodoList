const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname + "/date.js"); //requiring local modules need to use this format

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set('useFindAndModify', false);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to the todo list!",
});

const item2 = new Item({
  name: "Hit the + button to add a new task.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema =  {   //why is this not a new mongoose.Schema?
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  const day = date.getDate();
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items successfully added");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", { kindOfTitle: day, list: foundItems });

    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem
  const listName = req.body.list;

  const item =new Item({
    name: itemName})
  
  if (listName == date.getDate()) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err,foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  

  });

app.post("/delete", (req,res) => {
  const checkboxedId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    Item.findByIdAndRemove(checkboxedId,(err) =>{
      if (!err) {
        console.log("deletion successful")
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items : {_id: checkboxedId}}}, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName)
      }
    })
  }

  
})

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/:customListName",(req,res) => {
  const listName = _.capitalize(req.params.customListName);
  console.log(listName)

  List.findOne({name: listName}, (err,foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        })
        list.save();
        
        res.redirect("/" + listName)
      } else {
        res.render("list", {kindOfTitle: foundList.name, list: foundList.items })
      } 
    }
  })


})

app.listen(4000, () => {
  console.log("4000 port fk u");
});
