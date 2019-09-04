require('dotenv').config({ path: '.env' });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');

const app = express();

app.use(express.static(path.join(__dirname, 'client/slack/build')))
// const chatkit = new Chatkit.default({
//   instanceLocator: process.env.CHATKIT_INSTANCE_LOCATOR,
//   key: process.env.CHATKIT_SECRET_KEY,
// });

const chatkit = new Chatkit.default({
  instanceLocator: 'v1:us1:aadd6ca1-2c57-4a8b-9acf-bafee27d8fc1',
  key: '57d488c5-ae6e-4b2e-ba6e-b084f0fbf626:gnuA4U5NuEhfkyUrJ2Tu7dnThHp0/i9oP3ZzfTSrTOE='
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/users', (req, res) => {
  const { userId } = req.body;

  chatkit
    .createUser({
      id: userId,
      name: userId,
    })
    .then(() => {
      chatkit.addUsersToRoom({
        roomId: '8ec10840-ba30-4181-a450-41bf6cb70ea3',
        userIds: [userId]
      })
        .then(() => {
          res.sendStatus(200);
        })
        .catch(err => console.error(err))
    })
    .catch(err => {
      if (err.error === 'services/chatkit/user_already_exists') {
        console.log(`User already exists: ${userId}`);
        res.sendStatus(200);
      } else {
        res.status(err.status).json(err);
      }
    });
});

app.post('/authenticate', (req, res) => {
  const authData = chatkit.authenticate({
    userId: req.query.user_id,
  });
  res.status(authData.status).send(authData.body);
});

app.post('/create_room', (req, res) => {
  chatkit.createRoom({
    creatorId: req.body.owner,
    name: req.body.channelName,
    isPrivate: true,
    userIds: req.body.members
  })
    .then(() => {
      res.sendStatus(201);
    }).catch((err) => {
      console.log(err);
    });
});

app.post('/get_users', (req, res) => {
  chatkit.getUsers()
    .then((response) => {
      console.log(response);
      res.json(response);
    }).catch((err) => {
      console.log(err);
    });
});

app.post('/add_user_to_room', (req, res) => {
  chatkit.addUsersToRoom({
    roomId: req.body.roomId,
    userIds: req.body.members
  })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => console.error(err))
});

app.post('/get_user_rooms', (req, res) => {
  chatkit.getUserRooms({
    userId: req.body.userId
  })
    .then((response) => {
      console.log(response);
      res.json(response);
    }).catch((err) => {
      console.log(err);
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'client/slack/build/index.html'))
})

app.set('port', process.env.PORT || 5200);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
