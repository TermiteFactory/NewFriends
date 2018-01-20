
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Triggers when a new comer is added to the DB
 *
 */
exports.sendNewcomerNotification = functions.database.ref('/communities/{communityId}/data/summary/{summaryId}').onCreate(event => {
  const communityId = event.params.communityId;
  const summaryId = event.params.summaryId;

    console.log('Newcomer has been created Community:', communityId, 'for Person:', summaryId);

    // Get the list of device notification tokens.
    const getDeviceTokensPromise = admin.database().ref(`/communities/${communityId}/notifytokens`).once('value');

    // Get newcomer name
    const getNewcomerNamePromise = admin.database().ref(`/communities/${communityId}/data/summary/${summaryId}/name`).once('value');

    // Get the adder id.
    const getAdderIdPromise = admin.database().ref(`/communities/${communityId}/data/summary/${summaryId}/add_id`).once('value');

    return Promise.all([getDeviceTokensPromise, getNewcomerNamePromise, getAdderIdPromise]).then(results => {
        const tokensSnapshot = results[0];
        const newcomername = results[1];
        const adderid = results[2];

        // Check if there are any device tokens.
        if (!tokensSnapshot.hasChildren()) {
            console.log('There are no notification tokens to send to.');
            return;
        }
        console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');
        
        const newcomernameval = newcomername.val();
        const adderidval = adderid.val();
        console.log('Fetched follower profile', newcomernameval);

        // Notification details.
        const payload = {
            notification: {
                title: 'Newcomer Added!',
                body: `${newcomernameval} has been added to your community!`,
                sound: 'default',
                click_action: 'FCM_PLUGIN_ACTIVITY',
            },
            data: {
                titleData: 'Newcomer Added!',
                bodyData: `${newcomernameval} has been added to your community!`,
                adderId: adderidval
            }
        };

        // Set the message as high priority and have it expire after 24 hours.
        const options = {
            priority: "high",
        };

        // Listing all tokens.
        const tokens = Object.keys(tokensSnapshot.val());

        // Send notifications to all tokens.
        return admin.messaging().sendToDevice(tokens, payload, options).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
            }
            }
        });
        return Promise.all(tokensToRemove);
    });
  });
});

/**
 * Triggers when a new comer is assigned to you
 *
 */
exports.sendAssignmentNotification = functions.database.ref('/communities/{communityId}/data/summary/{summaryId}/followup_id').onUpdate(event => {
    const communityId = event.params.communityId;
    const summaryId = event.params.summaryId;
  
    console.log('Newcomer has been assigned to you for care:', communityId, 'for Person:', summaryId, ' to ', event.data.val());
  
    // Get the list of device notification tokens.
    const getDeviceTokensPromise = admin.database().ref(`/communitiesinfo/${communityId}/permissions/${event.data.val()}/notifytokens`).once('value');
  
    // Get new comer name.
    const getNewcomerNamePromise = admin.database().ref(`/communities/${communityId}/data/summary/${summaryId}/name`).once('value');

    // Get the adder id.
    const getAdderIdPromise = admin.database().ref(`/communities/${communityId}/data/summary/${summaryId}/assign_id`).once('value');
  
    return Promise.all([getDeviceTokensPromise, getNewcomerNamePromise, getAdderIdPromise]).then(results => {
      const tokensSnapshot = results[0];
      const newcomername = results[1];
      const assignid = results[2];
  
      // Check if there are any device tokens.
      if (!tokensSnapshot.hasChildren()) {
        console.log('There are no notification tokens to send to.');
        return;
      }
      console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');
      
      const newcomernameval = newcomername.val();
      const assignidval = assignid.val();
      console.log('Fetched follower profile', newcomernameval);
  
      // Notification details.
      const payload = {
        notification: {
          title: 'Newcomer Assigned to You!',
          body: `${newcomernameval} has been assigned for your care!`,
          sound: 'default',
          click_action: 'FCM_PLUGIN_ACTIVITY',
        },
        data: {
          titleData: 'Newcomer Assigned to You!',
          bodyData: `${newcomernameval} has been assigned for your care!`,
          adderId: assignidval
        }
      };
  
      // Set the message as high priority and have it expire after 24 hours.
      const options = {
          priority: "high",
      };
  
      // Listing all tokens.
      const tokens = Object.keys(tokensSnapshot.val());
  
      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload, options).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
            }
          }
        });
        return Promise.all(tokensToRemove);
      });
    });
  });