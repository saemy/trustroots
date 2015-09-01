(function() {
  'use strict';

  // Messages service used for communicating with the messages REST endpoints
  angular
    .module('messages')
    .factory('Messages', Messages);

  /* @ngInject */
  function Messages($resource) {

    function MessageHandler() {
      // Control flow variable; Prevents multiple identical ajax calls
      this.paginationTimeout = false;
      // Used in views for show/hide information
      this.resolved = '';
      this.nextPage = '';
    }

    MessageHandler.prototype = {
      parseHeaders: function (header) {
        if(header) {
          return {
            page: /<.*\/[^<>]*\?.*page=(\d*).*>;.*/.exec(header)[1],
            limit: /<.*\/[^<>]*\?.*limit=(\d*).*>;.*/.exec(header)[1]
          };
        }
        else {
          return header;
        }
      },
      /**
       * Fetches messages and sets up pagination environment
       * Takes additional query params passed in as key , value pairs
       */
      fetchMessages: function(param) {
        console.log('->fetchMessages start');
        var that = this;
        var query = (this.nextPage) ? angular.extend(this.nextPage, param) : param;

        if(!this.paginationTimeout) {
          this.paginationTimeout = true;

          return(this.ajaxCall.query(
            query,
            // Successful callback
            function(data, headers) {
              console.log('->fetchMessages success');

              that.nextPage = that.parseHeaders(headers().link);
              that.resolved = true;
              that.paginationTimeout = false;
            },
            // Error callback
            function() {
              console.log('->fetchMessages error');

              that.paginationTimeout = false;
              that.resolved = false;
            }
          ));
        }
      },
      ajaxCall: $resource('/api/messages/:userId',
        { userId: '@_id' },
        { update: { method: 'PUT' } }
      )
    };
    return MessageHandler;
  }

})();
