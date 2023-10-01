//import modules and dependencies
const moment = require('moment') //to display date/time


module.exports = {
    //function to format date using moment
    formatDate: function (date, format) {
        return moment(date).format(format)
    },
    //function to truncate a string to a particular length and add ellipsis
    truncate: function (str, len) {
        if (str.length > len && str.length > 0) {
            let new_str = str + ' '
            new_str = str.substr(0, len)
            new_str = str.substr(0, new_str.lastIndexOf(' '))
            new_str = new_str.length > 0 ? new_str : str.substr(0, len)
            return new_str + '...'
        }
        return str
    },
    //function to strip HTML tags from a string
    stripTags: function (input) {
        return input.replace(/<(?:.|\n)*?>/gm, '')
    },
    //function to display an edit icon to a story if the user is the story owner
    editIcon: function (storyUser, loggedUser, storyId, floating = true) {
      if (storyUser && loggedUser && storyUser._id && loggedUser._id) {
        if (storyUser._id.toString() === loggedUser._id.toString()) {
          if (floating) {
            return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
          } else {
            return `<a href="/stories/edit/${storyId}"><i class="fas fa-edit"></i></a>`;
          }
        } else {
          return '';
        }
      } else {
        return '';
      }
    },
    //function to keep a selected item in a dropdown list
      select: function (selected, options) {
        return options
          .fn(this)
          .replace(
            new RegExp(' value="' + selected + '"'),
            '$& selected="selected"'
          )
          .replace(
            new RegExp('>' + selected + '</option>'),
            ' selected="selected"$&'
          )
    },
    //function to increase the index value by one
      addIndex: function(index) {
        return index + 1
      }
      
}