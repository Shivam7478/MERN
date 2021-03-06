const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");

//@route   GET api/profile/me
//@desc    Get Current user profile
//@access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("User", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   POST api/profile
//@desc    Create or update user profile
//@access  Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .isEmpty(),
      check("skills", "skill is reqired")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (githubusername) profileFields.githubusername = githubusername;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (website) profileFields.website = website;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
      console.log(req.user.id);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("server error");
    }
  }
);

//@route   GET api/profile
//@desc    Get all profiles
//@access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("User", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

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

//@route   DELETE api/profile
//@desc    Delete profile , user & post
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
