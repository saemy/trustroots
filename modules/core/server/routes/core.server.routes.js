'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    redirect = require("express-redirect"),
    facebookNotificationService = require(path.resolve('./modules/core/server/services/facebook-notification.server.service')),
    core = require('../controllers/core.server.controller'),
    userProfile = require(path.resolve('./modules/users/server/controllers/users.profile.server.controller')),
    tribes = require(path.resolve('./modules/tribes/server/controllers/tribes.server.controller'));


module.exports = function (app) {

  redirect(app);

  app.redirect('/invite', '/signup');
  app.redirect('/tribes/lgbt', '/tribes/lgbtq');
  app.redirect('/tribes/vegans-vegetarians', '/tribes/veg');

  // Gives the service worker access to any config it needs
  app.route('/config/sw.js').get(core.renderServiceWorkerConfig);

  // CSP Violations
  // Note: If you’re using a CSRF module like csurf, you might have problems
  // handling these violations without a valid CSRF token. The fix is to put
  // your CSP report route above csurf middleware.
  // See `config/lib/express.js` and `initHelmetHeaders()` for more
  app.route('/api/report-csp-violation').post(core.receiveCSPViolationReport);

  // Excect CT Violations
  // Note: If you’re using a CSRF module like csurf, you might have problems
  // handling these violations without a valid CSRF token. The fix is to put
  // your CSP report route above csurf middleware.
  // See `config/lib/express.js` and `initHelmetHeaders()` for more
  app.route('/api/report-expect-ct-violation').post(core.receiveExpectCTViolationReport);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib|developers)/*').get(core.renderNotFound);

  // Define a tribes route to ensure we'll pass tribe object to index
  // Object is passed to layout at `core.renderIndex()`
  app.route('/tribes/:tribe').get(core.renderIndex);

  // Short URL for invite codes
  app.route('/c/:code').get(userProfile.redirectInviteShortUrl);

  // Define application route
  app.route('/*').get(core.renderIndex);

  // When Facebook notifications are enabled
  // Embedding app in Facebook canvas iframe is enabled, but it uses `POST`

  if (facebookNotificationService.isNotificationsEnabled()) {
    app.route('/*').post(core.renderIndex);
  }

  // Finish by binding the tribes middleware
  app.param('tribe', tribes.tribeBySlug);

};
