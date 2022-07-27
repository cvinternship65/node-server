const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { ObjectId, Int32, Decimal128, Binary } = require('bson');
const port = process.env.PORT || 4000;
const cors = require('cors');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mongodb = require('mongodb');
const binary = mongodb.Binary;
const mongoClient = mongodb.MongoClient;
const pdfParse = require("pdf-parse");

app.use(cors());
app.use(fileUpload());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('view engine', 'ejs');

/*--------------------------------enter your mongo url here-------------------------------- */
mongoose.connect("enter your mongo url", {useNewUrlParser: true},{useUnifiedTopology: true})


//create data schema
const applicantSchema = {
    name: String,
    totalExp : Number,
    gpa : Decimal128,
    majorSkill : String,
    os : Array,
    pl : Array,
    db : Array,
    tools : Array,
    majorExp : Number,
    minorSkill : String,
    minorExp : Number,
    langSkill : String,
    proficient : String,
    prescreenDate : String,
    interviewDate : String,
    startDate : String,
    currentSalary : Number,
    expectedSalary : Number,
    status : String,
    position : String,
    email : String,
    tel : String,
    softSkill : String,
    notes : String,
}

const applicantFileSchema = {
    appID : ObjectId,
    name : String,
    file : Buffer,
    genCV : Buffer,

}

const majorSkillSchema = {
    name : String,
    totalExp : Number,
    applicantName : String,
}

const minorSkillSchema = {
    name : String,
    totalExp : Number,
    applicantName : String,
}

const languageSkillSchema = {
    name : String,
    proficiency : String,
    applicantName : String,
}

const skillsetSchema = {
    name : String,
    category : String,
}

const Applicant = mongoose.model("Applicant",applicantSchema);
const ApplicantFile = mongoose.model("ApplicantFile",applicantFileSchema)
const MajorSkills = mongoose.model("MajorSkills", majorSkillSchema);
const MinorSkills = mongoose.model("MinorSkills", minorSkillSchema);
const LanguageSkills = mongoose.model("LanguageSkills", languageSkillSchema);
const Skillsets = mongoose.model("Skillsets", skillsetSchema);


app.get("/all-cv", function(req, res) {
    Applicant.find().then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/all-skill", function(req, res) {
    Skillsets.find().then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/singleApp/:id", function(req, res) {
    const id = req.params.id;
    Applicant.findById(id).then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/singleCV", function(req,res) {
    // const name = req.params.id;
    ApplicantFile.find().then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/singleCV/:id", function(req,res) {
    const name = req.params.id;
    ApplicantFile.findOne({appID : `${name}`}).then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

app.post("/upload", function(req, res) {
    
    let allSkill = req.body.majorSkill.split(',');
    console.log(allSkill);
    let skillsetData = [];
    let pl = [];
    let db = [];
    let tools = [];
    let lastOS = [];
    let lastPL = [];
    let lastDB = [];
    let lastIDE = [];
    Skillsets.find().then((result) => {
        skillsetData.push(result);
        for(let i = 0; i < result.length; i++){
            pl.push(result[i]);
        }
        for(let i = 0 ; i < pl.length; i++){
            db.push(Object.values(Object.values(pl[i])[2])[1]);
            tools.push(Object.values(Object.values(pl[i])[2])[2]);
        }
        for(let i = 0 ; i < allSkill.length; i++){
            for(let j = 0 ; j < pl.length; j++){
                //is this skillsets contain this skill input
                if(allSkill[i].toLowerCase() === Object.values(Object.values(pl[j])[2])[1].toLowerCase()){
                    //is skill input category is os
                    if(Object.values(Object.values(pl[j])[2])[2] === "Operating System"){
                        lastOS.push(Object.values(Object.values(pl[j])[2])[1]);
                        // lastOS.push(i);
                        break;
                     //is skill input category is programming lang
                    }
                    if(Object.values(Object.values(pl[j])[2])[2] === "Database"){
                        lastDB.push(Object.values(Object.values(pl[j])[2])[1]);
                        // lastDB.push(Object.values(Object.values(pl[j])[2])[2] === "Database");
                        break;
                    }
                    if(Object.values(Object.values(pl[j])[2])[2] === "Programming Language"){
                        lastPL.push(Object.values(Object.values(pl[j])[2])[1]);
                        // lastPL.push(Object.values(Object.values(pl[j])[2])[2]);
                        break;
                    }
                     //is skill input category is database
                    
                     //is skill input category is tools
                     if(Object.values(Object.values(pl[j])[2])[2] === "Tools and IDE"){
                        lastIDE.push(Object.values(Object.values(pl[j])[2])[1]);
                        // lastIDE.push(Object.values(Object.values(pl[j])[2])[2]);
                        break;
                    }
                }
            }
        }
    }).catch((err) => {
        console.log(err);
    })

    
    let app = { name: req.body.name,
        totalExp : req.body.exp,
        gpa : req.body.gpa,
        majorSkill : req.body.majorSkill,
        os : lastOS,
        pl : lastPL,
        db : lastDB,
        tools : lastIDE,
        majorExp : req.body.majorExp,
        minorSkill : req.body.minorSkill,
        minorExp : req.body.minorExp,
        langSkill : req.body.langSkill,
        proficiency : req.body.proficiency,
        prescreenDate : req.body.prescreenDate,
        interviewDateFrom : req.body.interviewDateFrom,
        interviewDateTo : req.body.interviewDateTo,
        startDate : req.body.startDate,
        status : req.body.status,
        position : req.body.position,
        email : req.body.email,
        tel : req.body.tel,
        softSkill : req.body.softSkill,
        notes : req.body.interviewNotes,
    }
    // let file = {
    //     name : req.body.name,
    //     file : binary(req.files.uploadedFile.data),
    //     genCV : binary(req.files.uploadedGenCV.data),
    // }
    insertFile(app, res,req)
    // insertApp(app,res)
    res.redirect('https://lucky-druid-669a9d.netlify.app/complete');
})

app.post("/update-skill", function(req, res) {
    let file = { skill: req.body.skill,
        category : req.body.category,}
    insertSkill(file, res)
    res.redirect('https://lucky-druid-669a9d.netlify.app/skillComplete');
})

app.post("/extract-text", (req, res) => {
    if(!req.files && !req.files.pdfFile){
        res.status(400);
        res.end();
    }

    pdfParse(req.files.pdfFile).then(result => {
        res.send(result.text);
    })
})

app.delete("/deleteSkill/:id", async(req,res) => {
    const id = req.params.id;

    await Skillsets.findByIdAndRemove(id).exec();
    await res.redirect('https://lucky-druid-669a9d.netlify.app/skillComplete');

})

app.delete("/deleteApplicant/:id", async(req,res) => {
    const id = req.params.id;

    await Applicant.findByIdAndRemove(id).exec();
    await res.redirect('https://lucky-druid-669a9d.netlify.app/searchApp');

})

app.get("applicant/:id", async(req,res) => {
    const id = req.params.id;
    Applicant.findOne({_id : id}).then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

async function insertFile(app, res,req) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('applicants')
            let filecollection = db.collection('applicantfiles')
            
            try {
                collection.insertOne(app)
                console.log('App Inserted')
                var objectId = app._id;
                // console.log(objectId);
                let file = {
                    appID : objectId,
                    name : req.body.name,
                    file : binary(req.files.uploadedFile.data),
                    genCV : binary(req.files.uploadedGenCV.data),
                }
                filecollection.insertOne(file)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            // client.close()
            // res.redirect('/')
        }

    })
}

async function insertApp(app, res) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('applicants')
            try {
                collection.insertOne(app)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            // client.close()
            // res.redirect('/')
        }

    })
}

async function insertSkill(file, res) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
            try {
                collection.insertOne(file)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            // client.close()
            // res.redirect('/')
        }

    })
}

async function getFiles(name) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('applicants')
            collection.find({name: name}).toArray((err, doc) => {
                if (err) {
                    console.log('err in finding doc:', err)
                }
                else {
                    let buffer = doc[0].file.buffer
                    console.log('found buffer:', buffer)
                    fs.writeFileSync('file.pdf', buffer)
                }
            })
            // client.close()
        }

    })
}

async function getFilesById(id) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('applicants')
            collection.find({_id: id}).toArray((err, doc) => {
                if (err) {
                    console.log('err in finding doc:', err)
                }
                else {
                    let buffer = doc[0].file.buffer
                    console.log('found buffer:', buffer)
                    fs.writeFileSync('file.pdf', buffer)
                }
            })
            // client.close()
        }

    })
}


app.listen(port, function() {
    console.log(`server is running on ${port}`);
})


module.exports = {app};