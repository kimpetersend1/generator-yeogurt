/**
*   Index View Spec Test
*/
<% if (testFramework === 'mocha') { %>
/*jshint expr: true*/<% } %>

'use strict';

describe('Index View Namespace', function() {

    beforeEach(function () {
        this.indexView = new <%= _.classify(projectName) %>.Views.Index();
    });

    it('provides the "Index View" object', function() {
        // Expect exists and is an object.
        expect(<%= _.classify(projectName) %>.Views.Index)<% if (testFramework === 'jasmine') { %>.toBeDefined()<% } else if (testFramework === 'mocha') { %>.to.be.ok<% } %>;
    });

});