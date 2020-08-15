const admin = require('firebase-admin')

module.exports = (req, res, next) => {
      const token = req.headers.authorization.split(' ')[1];
      
      admin.auth().verifyIdToken(token)
      .then(decodedToken => {
          let uid = decodedToken.uid
          next()
      })
      .catch(error => {
          res.status(401).send({msg:"Unauthorized!", code:401})
      })
  };