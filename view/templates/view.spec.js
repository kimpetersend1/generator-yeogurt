 /**
*   <%= _.classify(name) %> Spec Description
*/
<% if (testFramework === 'mocha') { %>
/*jshint expr: true*/<% } %>
<% if (jsOption === 'requirejs') { %>
define(function(require) {
    'use strict';

    var <%= _.classify(name) %> = require('<%= viewFile %>');

    describe('<%= _.classify(name) %> View', function () {

        beforeEach(function () {
            this.<%= _.classify(name) %> = new <%= _.classify(name) %>();
        });

        it('Should run a few assertions', function(){

        });

    });

});<% } else if (jsOption === 'browserify') { %>
'use strict';

var <%= _.classify(name) %> = require('<%= rootDir %><%= viewFile %>');

describe('<%= _.classify(name) %> View', function () {

    beforeEach(function () {
        this.<%= _.classify(name) %> = new <%= _.classify(name) %>();
    });

    it('Should run a few assertions', function(){

    });

});<% } %>