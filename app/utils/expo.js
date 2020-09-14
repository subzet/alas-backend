// const Expo = require('expo-server-sdk').default;
// const expo = new Expo();


async function push(message) {
//   if (!Expo.isExpoPushToken(message.to)) {
//     console.error(`Push token ${message.to} is not a valid Expo push token`);
//     return;
//   }
//   const messages = [];

//   messages.push(message)

//   console.log('sending to expo push', messages);
//   const chunks = expo.chunkPushNotifications(messages);
//   for (let chunk of chunks) {
//     try {
//       let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       console.log(ticketChunk);
//     } catch (error) {
//       console.error(error);
//     }
//   }

    console.log("Sending message", message)
}


module.exports = { push };