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
router.get("/pendinglist", auth, async (req, res) => {
  try {
    const list = await List.find({
      user: req.user.id,
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
router.get("/completedlist", auth, async (req, res) => {
  try {
    const list = await List.find({
      user: req.user.id,
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
      check("title", "status is required")
        .not()
        .isEmpty(),
      check("text", "skill is reqired")
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

//@route   POST api/list
//@desc    Update user list
//@access  Private
router.post(
  "/",
  [
    auth,
    [
      check("title", "status is required")
        .not()
        .isEmpty(),
      check("text", "skill is reqired")
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
      let list = await List.findOne({ _id: req.params.id });
      if (list) {
        //Update
        list = await List.findOneAndUpdate(
          { _id: req.id },
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

//@route   GET api/profile/user/:user_id
//@desc    Get profile by user ID
//@access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("User", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("server error");
  }
});

//@route   DELETE api/list
//@desc    Delete List of user
//@access  Private
router.delete("/", async (req, res) => {
  try {
    console.log(req.user);

    //@todo -  remove users posts
    //Remove profile
    await Profile.findOneAndRemove({
      user: req.user.id
    });

    await User.findOneAndRemove({
      _id: req.user.id
    });
    res.json({ msg: "User deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
