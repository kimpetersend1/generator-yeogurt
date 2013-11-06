/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;


describe('yeogurt generator', function () {
    beforeEach(function (done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
            if (err) {
                return done(err);
            }

            this.app = helpers.createGenerator('yeogurt:app', [
                '../../app'
            ]);
            done();
        }.bind(this));
    });

    it('creates expected files', function (done) {
        var expected = [
            // add files and folders you expect to exist here.
            'dev/',
            'dev/markup',
            'dev/markup/templates',
            'dev/markup/pages',
            'dev/markup/components',
            'dev/markup/elements',
            'dev/markup/partials',
            'dev/markup/partials/all-partials.jade',
            'dev/markup/partials/README.md',
            'dev/markup/components/all-components.jade',
            'dev/markup/components/head.jade',
            'dev/markup/components/header.jade',
            'dev/markup/components/footer.jade',
            'dev/markup/elements/all-elements.jade',
            'dev/markup/elements/heading.jade',
            'dev/markup/pages/index.jade',
            'dev/markup/templates/base.jade',
            'dev/markup/templates/one-column.jade',
            'dev/styles',
            'dev/styles/components',
            'dev/styles/elements',
            'dev/styles/pages',
            'dev/styles/partials',
            'dev/styles/vendor',
            'dev/styles/modules',
            'dev/styles/templates',
            'dev/styles/main.less',
            'dev/scripts',
            'dev/scripts/components',
            'dev/scripts/vendor',
            'dev/scripts/main.js',
            'dev/scripts/app.js',
            'dev/scripts/components/example.js',
            'ftppass.json',
            'dev/images',
            'dev/styles/fonts',
            'docs',
            'docs/README.md',
            '.editorconfig',
            'Gruntfile.js',
            'dev/.htaccess',
            'dev/index.html',
            'bower.json',
            'config.json',
            'package.json',
            '.bowerrc',
            'dev/robots.txt',
            'dev/404.html',
            'dev/favicon.ico',
            'dev/dashboard',
            'dev/dashboard/markup',
            'dev/dashboard/markup/pages',
            'dev/dashboard/markup/elements',
            'dev/dashboard/markup/components',
            'dev/dashboard/markup/templates',
            'dev/dashboard/markup/partials',
            'dev/dashboard/images',
            'dev/dashboard/styles',
            'dev/dashboard/styles/fonts',
            'dev/dashboard/styles/vendor',
            'dev/dashboard/styles/partials',
            'dev/dashboard/styles/pages',
            'dev/dashboard/styles/components',
            'dev/dashboard/styles/elements',
            'dev/dashboard/styles/templates',
            'dev/dashboard/scripts',
            'dev/dashboard/scripts/vendor',
            'dev/dashboard/scripts/components',
            'dev/dashboard/scripts/app.js',
            'dev/dashboard/scripts/main.js',
            'dev/dashboard/scripts/components/example.js',
            'dev/dashboard/markup/components/all-components.jade',
            'dev/dashboard/markup/components/head.jade',
            'dev/dashboard/markup/components/header.jade',
            'dev/dashboard/markup/components/footer.jade',
            'dev/dashboard/markup/elements/all-elements.jade',
            'dev/dashboard/markup/elements/heading.jade',
            'dev/dashboard/markup/pages/index.jade',
            'dev/dashboard/markup/templates/base.jade',
            'dev/dashboard/markup/templates/one-column.jade',
            'dev/dashboard/markup/partials/all-partials.jade',
            'dev/dashboard/markup/partials/README.md'
        ];

        helpers.mockPrompt(this.app, {
            projectName: 'testing',
            versionControl: 'Git',
            htmlOption: 'Jade',
            cssOption: 'LESS',
            linters: ['JSHint'],
            jshint: 'y',
            useFTP: 'y',
            haveDashboard: 'y'
        });
        this.app.options['skip-install'] = true;
        this.app.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });
});