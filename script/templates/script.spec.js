/**
*   <%= _.classify(name) %> Spec Description
*/
<% if (testFramework === 'mocha') { %>
/*jshint expr: true*/<% } %>
<% if (jsOption === 'requirejs') { %>
define(function(require) {
    'use strict';

    var <%= _.classify(name) %> = require('<%= scriptFile %>');

    describe('Give it some context', function() {

        it('Should run a few assertions', function() {

        });

    });

});<% } else if (jsOption === 'browserify') { %>
'use strict';

var <%= _.classify(name) %> = require('<%= rootDir %><%= scriptFile %>');

describe('Give it some context', function() {

    it('Should run a few assertions', function() {

    });

});
<% } else { %>'use strict';

describe('Give it some context', function() {

    it('Should run a few assertions', function() {

    });

});<% } %>