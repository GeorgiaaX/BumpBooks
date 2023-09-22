const express = require('express')
const app = express()
const router = express.Router()
const {ensureAuth} = require('../middleware/auth')

const path = require('path') 

const Story = require('../models/Story')
const Bump = require('../models/Bump')
const User = require('../models/User')

app.use(express.static('public'))


//@desc Show add page
//@router GET /stories/add
router.get('/add', ensureAuth, (req,res) => {
    res.render('stories/add')
})



//@desc Process add form
//@Route POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {

        req.body.user = req.user.id;

        const newStory = await Story.create(req.body);

        await Bump.create({
            story: newStory._id,
            user: req.user.id, 
        });
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


//@desc Show all stories
//@router GET /stories
router.get('/', ensureAuth, async (req,res) => {
    try {
        const stories = await Story.find({status: 'public'})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean()
        res.render('stories/index', {
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//@desc Show top stories
//@router GET /stories/bumped
router.get('/bumped', ensureAuth, async (req,res) => {
    try {
            const stories = await Story.find({ status: 'public'})
            .populate('user')
            .sort({ bumps: -1 })
            .lean()
            
            res.render('stories/bumped', {
                stories,
            })


    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})




//@desc Show single story
//@router GET /stories/:id
router.get('/:id', ensureAuth, async (req,res) => {
    try {
        let story = await Story.findById(req.params.id)
        .populate('user')
        .lean()

        const bumps = await Bump.find({ story: req.params.id }).lean();
        const foundBump = bumps.find((bump) => bump.user.toString() === req.user.id);

        const bump = foundBump ? foundBump.bump : false;

        if(!story) {
            return res.render('error/404')
        }

        res.render('stories/show', {
            story,
            bump
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//@desc Show edit page
//@router GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req,res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()

        if(!story) {
            return res.render('error/404')
        }

        if(story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
    }
})

//@desc Update Stories
//@router PUT /stories/:id
router.put('/:id', ensureAuth, async (req,res) => {
    try {
        let story = await Story.findById(req.params.id)
        .lean()

    if(!story) {
            return res.render('error/404')
        }

    if(story.user != req.user.id) {
        res.redirect('/stories')
    } else {
    story = await Story.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {new: true, 
    runValidators: true})
        }

    res.redirect('/dashboard')

    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


//@desc Delete Story
//@router delete /stories/:id
router.delete('/:id', ensureAuth, async (req,res) => {
    try {
        await Story.findOneAndDelete( {_id: req.params.id})
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Profile User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {  
    try {

        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .sort( { createdAt : 'desc'})
            .lean()
        res.render('stories/profile', {
            userId: req.user.userId,
            name: req.user.displayName,
            image: req.user.image,
            profileDesc: req.user.profileDesc,
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
  })



  //@desc Update Bump
  //@router PUT /stories/:id

  router.put('/bump/:id', ensureAuth, async (req, res) => {
    try {
        const bumps = await Bump.find({story: req.params.id})
        const foundBump = bumps.find((bump) => bump.user.toString() === req.user.id);

        if (!foundBump) {
            await Bump.create({
                user: req.user.id,
                story: req.params.id,
                bump: true, 
            });
        } else {
            foundBump.bump = !foundBump.bump;
            await foundBump.save();
        }

        const bumpCount = await Bump.countDocuments({
                story: req.params.id,
                bump: true,
            });

        await Story.findByIdAndUpdate(
             req.params.id,
           {bumps: bumpCount})

            res.redirect('/stories/bumped')
        } catch (err) {
        console.error(err)
        res.render('error/500')
    }
  })


module.exports = router