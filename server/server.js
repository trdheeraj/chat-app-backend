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
  instanceLocator: 'v1:us1:4811d398-69b5-472e-bfcf-e24d61e97f14',
  key: '26a95160-a5cc-4454-98fe-e701e72acc8f:oxCxu+Iszm6UDQAdm8IHXQl6XJy8DspZl+gZfuSyZJU='
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
        roomId: 'afa1c12e-b196-4bb4-b940-a1af439328be',
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
