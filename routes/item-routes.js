const mongoose = require('mongoose');
const passport = require('passport');

const Item = mongoose.model('Item');

module.exports = (app) => {
  // add :amount
  app.get('/items', (req, res) => {
    Item.find()
    .select({ id: 1, headline: 1 })
    .then(response => {
      return res.json({
        items: response,
      });      
    })
    .catch(error => {
      return res.status(500).json({
        message: 'An error occurred while performing the query for items',
      });
    });
  });

  app.get('/item/:id', (req, res) => {
    // validate req.params.id
    Item.findById(req.params.id)
    .then(response => {
      return res.json({
        item: response,
      });
    })
    .catch(error => {
      return res.status(500).json({
        message: 'An error occurred while performing the query for this item',
      });
    });
  });

  app.post(
    '/item',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      // validation
      new Item({
        content: req.body.content,
        headline: req.body.headline,
        creator: req.user.id,
      })
      .save()
      .then(newItem => {
        return res.json({
          item: newItem,
          message: 'New item was saved successfully',
        });
      })
      .catch(error => {
        return res.status(500).json({
          message: 'An error happened while saving this item',
        });
      })
    }
  );

  app.patch(
    '/item/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      console.log(req.user);
      // check whether authorized user is creator of item before db query
      // validation
      const query = {
        _id: req.params.id,
        creator: req.user.id,
      };
      // validation
      const update = {
        $set: {
          content: req.body.content,
          headline: req.body.headline,
        },
      };
      Item.findOneAndUpdate(query, update, { new: true })
      .then(updatedItem => {
        if (updatedItem) {
          return res.json({
            item: updatedItem,
            message: 'Item was updated successfully',
          });
        }
        return res.status(500).json({
          message: 'No such item or you are not authorized to update this item',
        });
      })
      .catch(error => {
        return res.status(500).json({
          message: 'An error happened while updating this item',
        });
      });
    }
  );



};
