const express= require("express");
const bodyParser= require("body-parser");
const { render, redirect } = require("express/lib/response");
//const date= require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _= require("lodash");
const prompt= require("prompt");
const { Timestamp } = require("mongodb");
const app= express();
const {alert} = require("node-popup");
const cron = require("cron");
const https = require("https");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

  mongoose.connect("mongodb+srv://rajatmishra:tasktracker_123@cluster0.4xnw39l.mongodb.net/?retryWrites=true&w=majority");
// mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema= 
{
   name: String
};

const Item = mongoose.model("item",itemSchema);

const listSchema=
{
    name: String,
    items: [itemSchema]
};

const List= mongoose.model("List", listSchema);

app.get("/",function(req,res)
{
   
   Item.find({},function(err,foundItems)
   {
      res.render("list",{listTitle:"Today", tasknext:foundItems});
   });
});

app.post("/",function(req,res)
{

   const itemdesp= req.body.nextTask;
   const itemElements= itemdesp.split(", ");
   const itemName= itemElements[0];
   const listName= req.body.list;
   let currentMonth= itemElements[1];
   let currentDate= itemElements[2];
   let currentYear= itemElements[3];
   let curerntTime= itemElements[4];
   currentDate= currentMonth +" "+ currentDate +", "+currentYear;  
   const item = new Item(
      {
         name: itemName,
         date: currentDate,
         time: curerntTime
      });
      
      if(listName=== "Today")
      {
         item.save();
         res.redirect("/");  
      }
      else 
      {
         List.findOne({name: listName}, function(err, foundList)
         {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
         } );
      }
});

app.post("/delete",function(req,res)
{
    const checkedItemID = req.body.checkbox;
    console.log(checkedItemID);
    const listName= req.body.listName;
    const deleteTime=  req.body.time;
    const deleteDate=  req.body.date;
    const deletedTimeline= new Date(deleteDate+" "+deleteTime+":00");
    console.log(deleteDate+" "+deleteTime);
    console.log(deleteTime);
    console.log(deletedTimeline);
    if(listName==="Today")
    {
      Item.findByIdAndRemove(checkedItemID, function(err)
      {
           if(err)
           {
              console.log(err);
           }
           else 
           {
              
              console.log("Deleted");
              let collection=[];
              let handleClick=(arr)=>{
                 collection=[...arr];
                 for(let i=0;i<collection.length;i++)
                 {
                    let newdate= collection[i].date;
                    let newTime= collection[i].time;
                    let compareTimeline= new Date(newdate+" "+newTime);
                    if(compareTimeline<deletedTimeline)
                    {
                       Item.findOneAndRemove(collection[i].name, function(err)
                       {
                          if(err)
                          {
                             console.log(err);
                          }
                          else 
                          {
                             console.log("deleted again");
                          }
                       });
                       console.log(collection[i].name);
                    }
                  }
                res.redirect("/");
              }
              Item.find({},function(err,arr)
              {
                  handleClick(arr);
              });
           }
      });
    }
   //  else
   //  {
   //     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID }}}, function(err)
   //     {
   //        if(!err)
   //        {
   //           res.redirect("/"+ listName);
   //        }
   //     });
   //  }
});


app.listen(3000,function()
{
   console.log("Server is listening");
});


//https://trackingtasks.onrender.com
const job = new cron.CronJob("*/10 * * * *", ()=>{
   https.get("https://tasktracker-hmj4.onrender.com", (res)=>{
     if(res.statusCode==200)
     {
       console.log("server restarted");
     }
     else{
       console.log("error in server restarting");
     }
   })
})

job.start();