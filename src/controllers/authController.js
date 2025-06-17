function signup_get(req, res) {
  res.render('signup')
}

function signup_post(req, res) {
  res.send('new signup')
}


export {
  signup_get,
  signup_post
}