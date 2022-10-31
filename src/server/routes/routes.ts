import express from "express";
import {
  createPerson,
  deletePerson,
  searchUsers,
  exportUsers,
  allUsers,
  updateUser,
  updateTheUser,
} from "../controllers/users";

const router = express.Router();

router.post("/register", createPerson);

router.put("/updateUser/:id", updateUser);

// update the class no incrementing one....
router.put("/updateUserWithClass", updateTheUser);
//-----------------------------------------

router.delete("/delete/:id", deletePerson);

router.post("/search", searchUsers);

router.get("/downloadExcel", exportUsers);

router.get("/", allUsers);

export { router };
