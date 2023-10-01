
module.exports = {
    //middleware to check if user is authenticatted
    ensureAuth: function (req, res, next) {
        if(req.isAuthenticated()) {
            //if the user is authenticate call the next route handler
            return next()
            //if the user is not authenticated, redirect them to landing page
        } else {
            res.redirect('/')
        }
    },
    //middleware to check if the user is a guest (not authenticated)
    ensureGuest: function (req, res, next) {
        //if the user is authenticated, redirect to dashboard page
        if(req.isAuthenticated()) {
            res.redirect('/dashboard')
            //if the user is not authenticated, call the next route handler
        } else {
            return next()
        }
    }
}