import  { Request, Response } from "express";
import UserModel from "../models/users";

//importing crypto module to generate random binary data
import CryptoJS from 'crypto-js';

// var cron = require('node-cron');


import cron from 'node-cron'
import moment from "moment";
import nodemailer from 'nodemailer';
import xlsx from 'xlsx'
import { v4 } from 'uuid';

const excelJS = require("exceljs");
// import * as excelJS from 'exceljs'
// import excel from 'exceljs';


// ....... all users fetching....................
const allUsers = async (req: Request, res: Response) => {
  let skip = 0;
  let limit = 10;

  let myData = await UserModel.find().skip(skip);
  // .limit(limit);

  res.json({
    message: "Users Page",
    myData: myData,
    // newUserData,
  });
};

// .......  user  sign up   ....................
const createPerson = async (req: Request, res: Response) => {
  try {
    const { name, classNumber, email, password, phone, dob, photo, isDeleted } =
      req.body;

    const pswd = req.body.password;

    // ...........................................password.encrypting............................................
    var ciphertext = CryptoJS.AES.encrypt(pswd, "crud secret 763").toString();

    console.log("encrypted text ....... cipherrrrrr", ciphertext);

    const dateIn = req.body.dob;

    const newDate = moment.utc(dateIn, "DD/MM/YYYY").toDate();
    moment().format();

    // console.log('newwwwwwwwww', newDate);

    const userData = {
      name: req.body.name,
      classNumber: req.body.classNumber,
      email: req.body.email,
      password: ciphertext,
      phone: req.body.phone,
      dob: newDate,
      photo: req.body.photo,
      isDeleted: req.body.isDeleted,
    };

    // console.log("userdddddddddddd", userData);

    const user = await UserModel.create(userData);

    console.log("uuuuuu  user", user);

    // ...........................................password.decrypting.....................................................

    const decryptUser = userData.password;

    // console.log('deccccccrypt userrr', decryptUser);

    var bytes = CryptoJS.AES.decrypt(decryptUser, "crud secret 763");
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    // console.log("decrypted password..........", originalText);

    // ------------------------------------------------------------------------------------------------------------------

    res.status(201).json({ user: user._id, created: true });
  } catch (error) {
    console.log("errrrr", error);
    res.status(500).json({
      error,
      created: false,
    });
  }
};

// ....... edit user....................
const updateUser = async (req: Request, res: Response) => {
  try {
    // console.log("idsssssssss", req.body);
    const { name, classNumber, email, password, phone, dob, photo, isDeleted } =
      req.body;

    const data = await UserModel.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "User profile updated successfully..." });
  } catch (error) {
    console.log(error);
    res.status(500).send("Updation failed!!");
  }
};

// ....... edit user with classnumber....................
const updateTheUser = async (req: Request, res: Response) => {
  try {
    console.log("updating userrr");

    const classNumber: any = req.query.classNumber;
    const name: any = req.query.name;

    const classNum = parseInt(classNumber);

    // console.log('reaach', typeof(classNum));

    if (!classNum && !name) {
      console.log("Please fill all the details....");
      res.status(500).send("Please fill all the details....");
    } else if (!classNum) {
      console.log("class null");
      res.status(500).send("Please provide the class number");
    } else if (!name) {
      console.log("name null");
      res.status(500).send("Please provide the name");
    } else if (classNum && name) {
      const update = await UserModel.updateMany(
        { name: { $regex: name }, classNumber: classNum },
        { $inc: { classNumber: 1 } }
      );

      const updatedData = await UserModel.find({
        name: { $regex: name },
        classNumber: classNum + 1,
      });

      // console.log("updatedddd", updatedData);

      res.json({ message: "success. class incremented...", data: updatedData });
    }
  } catch (error) {
    res.status(500).send("Class not incremented. error!!!");
  }
};

// ........permanent delete user...................
// const deletePerson = async (req: Request, res: Response) => {
//   try {
//     await UserModel.findByIdAndDelete(req.params.id);
//     res.send("User deleted successfully...");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error);
//   }
// };

// .......soft delete user...................
const deletePerson = async (req: Request, res: Response) => {
  try {
    const person: any = await UserModel.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    );

    res.json({
      message: "User deleted Successfully..",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// ....... search users....................
const searchUsers = async (req: Request, res: Response) => {
  try {
    let userData = req.body;
    // let skip = userData.skip || 0;
    let limit = userData.limit || 10;
    let advanceQuery: any;
    advanceQuery = await createAdvanceQuery(userData);
    // console.log("advance query", advanceQuery);

    let finalQuery = {};
    // console.log(advanceQuery.finalFilterQuery);
    if (advanceQuery.finalFilterQuery) {
      finalQuery = JSON.parse(`{${advanceQuery.finalFilterQuery}}`);
    }
    // console.log(JSON.stringify(finalQuery));

    // console.log('ffffffffff', finalQuery);

    let totalCount = await UserModel.find(finalQuery).count();
    let users = await UserModel.find(finalQuery).limit(limit);


    if (users.length == 0) {
      res.send("No users with this details!!!");
    } else {
      res.json({
        message: "success fetching",
        data: users,
        totalCount,
      });
    }
  } catch (error) {
    console.log("errorrrrrrr", error);
    res.status(500).send(error);
  }
};

// function of searching users...................
function createAdvanceQuery(reqData: any) {
  return new Promise((res, rej) => {
    let appendQuery = "";

    let isEmpty = Object.values(reqData).every((x) => x === null || x === "");
    let objKeys = Object.keys(reqData);

    if (isEmpty) {
      res("");
      return;
    }

    for (let i = 0; i < objKeys.length; i++) {
      //  console.log('obbbbbbbbbb', objKeys[i]);
      //  console.log('occcccccccc', reqData[objKeys[i]]);

      if (reqData[objKeys[i]] != null && reqData[objKeys[i]] != undefined) {
        if (objKeys[i] == "classNumber" && reqData[objKeys[i]] != "") {
          // console.log('qqqqqqqqq', reqData[objKeys[i]]);

          appendQuery += `"classNumber": ${reqData[objKeys[i]]}  ,`;
          // console.log('insideeeeee entereddddddd');
        } else if (objKeys[i] == "searchText" && reqData[objKeys[i]] != "") {
          // console.log('else if entered...');

          appendQuery += `"$or": [
            
            {"name": { "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }},
            {"email":{ "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }},
            {"phone":{ "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }}
          
              ] ,`;
        }
      }
    }

    let n = appendQuery.lastIndexOf(",");
    let finalFilterQuery = appendQuery.slice(0, n);
    // console.log(JSON.stringify(finalFilterQuery));
    res({ finalFilterQuery: finalFilterQuery });
  });
}


// ...................................................................................

const exportUsers = async (req: Request, res: Response) => {
  let fromDate: any = req.query.dobFrom;
  let lastDate: any = req.query.dobTo;

  // console.log("reeeeeeeeeeeeee.........", fromDate, lastDate);

  const fDate = moment.utc(fromDate, "YYYY/MM/DD").toDate();
  moment().format();

  const workbook = new excelJS.Workbook();

  const worksheet = workbook.addWorksheet("excelUsers");

  // const path = "../../public/assets/";

  // console.log("path addeddd...........", path);

  worksheet.columns = [
    { header: "S no.", key: "_id", width: 10 },
    { header: "class no.", key: "classNumber", width: 10 },
    { header: "Name", key: "name", width: 10 },
    { header: "Email Id", key: "email", width: 10 },
    { header: "Phone", key: "phone", width: 10 },
    { header: "Date of Birth", key: "dob", width: 10 },
    { header: "delete status", key: "isDeleted", width: 10 },
  ];

  let counter = 1;

  const User = await UserModel.find(
    {
    dob: {
      $gte: fromDate,
      $lt: lastDate,
    },
  });

  // console.log("user coming...........", User);

  User.forEach((user) => {
    user.classNumber = counter;
    worksheet.addRow(user);
    counter++;
  });

  worksheet.getRow(1).eachCell((cell: any) => {
    cell.font = { bold: true };
  });

  try {

    const data = await workbook.xlsx.writeFile(
      v4()+".xlsx"
    );
  

     const buffer = await workbook.xlsx.writeBuffer('excelSheet of student ' + fromDate + '-' + lastDate + '.xlsx');

    // console.log('bbbbbbbbb', buffer);


    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jayakrishnan@scriptlanes.com",
        pass: "sivzgeycbgqpmsnz"
      }
    } )

    let details = {
      from: "jayakrishnan@scriptlanes.com",
      to: "jayakrishnansfc43@gmail.com",
      subject: "Student details in Excel file",
      // text: "Testing out first sender"
      html: 'content of the users',
        attachments: [
            {
                buffer,
                content: buffer,
                contentType:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
    }

    await mailTransporter.sendMail(details, (err: any) => {
      if(err) {
        console.log('There is an error ...', err);
        
      }
      else {
        console.log('email has sent!');
        
      } 
    })

    res.send({
      status: "success",
      message: "file sent to mail successfully!",
      // path: `${path}/users.xlsx`,
    });

  } catch (error) {
    res.send({
      status: "error",
      message: "Something went wrong",
    });
  }
};


// cron jobs fn................................
// cron.schedule('*/3 */2 * * * *', () => {

//   const workbook = new excelJS.Workbook();

//   const worksheet = workbook.addWorksheet("excelUsers");
//   const data =  workbook.xlsx.writeFile(
//     v4()+".xlsx"
//   );
// });
 

export {
  allUsers,
  createPerson,
  updateUser,
  updateTheUser,
  deletePerson,
  searchUsers,
  exportUsers,
};
