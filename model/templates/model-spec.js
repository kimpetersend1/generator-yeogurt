/**
*   <%= _.classify(name) %> Spec Description
*/
<% if (testFramework === 'mocha') { %>
/*jshint expr: true*/<% } %>
<% if (jsOption === 'requirejs') { %>
define(function(require) {
    'use strict';

    var <%= _.classify(name) %> = require('models/<%= folder ? cleanFolderPath(folder) + '/' : ''%><%= _.slugify(name.toLowerCase()) %>');

    describe('<%= _.classify(name) %> Model', function () {

        beforeEach(function () {
            this.<%= _.classify(name) %>Model = new <%= _.classify(name) %>();
        });

        it('Should run a few assertions', function(){

        });

    });

});<% } else if (jsOption === 'browserify') { %>
'use strict';

var <%= _.classify(name) %> = require('<%= folder ? folderCount : ''%>../../../client/scripts/models/<%= folder ? cleanFolderPath(folder) + '/' : ''%><%= _.slugify(name.toLowerCase()) %>.js');

describe('<%= _.classify(name) %> Model', function () {

    beforeEach(function () {
        this.<%= _.classify(name) %>Model = new <%= _.classify(name) %>();
    });

    it('Should run a few assertions', function(){

    });

});<% } %>
