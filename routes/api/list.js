const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const List = require("../../models/List");

//@route   GET api/list/pendinglist
//@desc    Get Current user list
//@access  Private
router.get("/pending", auth, async (req, res) => {
  try {
    const list = await List.find({
      userID: req.user.id,
      status: "false"
    });
    if (!list) {
      return res.status(400).json({ msg: "there is no list for this user" });
    }
    res.json(list);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   GET api/list/completedlist
//@desc    Get Current user list
//@access  Private
router.get("/completed", auth, async (req, res) => {
  try {
    const list = await List.find({
      userID: req.user.id,
      status: "true"
    });
    if (!list) {
      return res.status(400).json({ msg: "there is no list for this user" });
    }
    res.json(list);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   POST api/list
//@desc    Create user list
//@access  Private
router.post(
  "/",
  [
    auth,
    [
      check("title", "title is required")
        .not()
        .isEmpty(),
      check("description", "description is reqired")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    const { title, description } = req.body;
    //Build list object
    const listFields = {};
    listFields.userID = req.user.id;
    if (title) listFields.title = title;
    if (description) listFields.description = description;

    try {
      //create
      list = new List(listFields);
      await list.save();
      res.json(list);
      console.log(req.user.id);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("server error");
    }
  }
);

//@route   Put api/list
//@desc    Update user list
//@access  Private
router.put(
  "/update/:id",
  [
    auth,
    [
      check("title", "title is required")
        .not()
        .isEmpty(),
      check("description", "description is reqired")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    const { title, description, status } = req.body;
    //Build list object
    const listFields = {};

    try {
      if (title) listFields.title = title;
      if (description) listFields.description = description;
      if (status) listFields.status = status;
      let list = await List.findOne({ _id: req.params.id });
      if (list) {
        //Update
        console.log("hello");

        list = await List.findOneAndUpdate(
          { _id: req.params.id },
          { $set: listFields },
          { new: true }
        );
        return res.json(list);
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("server error");
    }
  }
);

//@route   DELETE api/list
//@desc    Delete List of user
//@access  Private
router.delete("/:id", async (req, res) => {
  try {
    console.log(req.user);

    //@todo -  remove users posts
    //Remove profile
    await List.findOneAndRemove({
      _id: req.params.id
    });
    res.json({ msg: "List deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
