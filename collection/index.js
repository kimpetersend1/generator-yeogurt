'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var cleanFolderPath = require('../helpers/clean-folder-path');
var deleteFile = require('../helpers/delete-file');

var CollectionGenerator = module.exports = function CollectionGenerator() {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);

    var fileJSON = this.config.get('config');

    // options
    this.useModel = this.options.model || false;
    this.folder = this.options.folder || '';
    this.delete = this.options.delete || false;
    this.jsFramework = fileJSON.jsFramework;
    this.jsOption = fileJSON.jsOption;
    this.singlePageApplication = fileJSON.singlePageApplication;
    this.testFramework = fileJSON.testFramework;
    this.useTesting = fileJSON.useTesting;

    var getNumberOfPaths = [];
    this.folder.split('/').forEach(function(item) {
        if (item) {
            getNumberOfPaths.push('../');
        }
    });
    this.folderCount = getNumberOfPaths.join('');

    // Remove all leading and trailing slashes in folder path
    this.cleanFolderPath = cleanFolderPath;
};

util.inherits(CollectionGenerator, yeoman.generators.NamedBase);

CollectionGenerator.prototype.files = function files() {
    this.log('You called the collection subgenerator with the argument ' + this.name + '.');

    if (!this.singlePageApplication) {
        this.log('This subgenerator is not available for Static Sites.\nOperation aborted');
        return;
    }
    else if (this.jsFramework === 'react') {
        this.log('This subgenerator is not available for React application.\nOperation aborted');
    }
    else if (this.singlePageApplication) {
        if (!this.delete) {
            this.template('collection.js', 'client/scripts/collections/' + this.cleanFolderPath(this.folder) + this._.slugify(this.name.toLowerCase()) + '.js');
            if (this.useTesting) {
                this.template('collection-spec.js', 'test/spec/collections/' + this.cleanFolderPath(this.folder) + this._.slugify(this.name.toLowerCase()) + '-spec.js');
            }
        }
        else {
            deleteFile('client/scripts/collections/' + this.cleanFolderPath(this.folder) + this._.slugify(this.name.toLowerCase()) + '.js', this);
            if (this.useTesting) {
                deleteFile('test/spec/collections/' + this.cleanFolderPath(this.folder) + this._.slugify(this.name.toLowerCase()) + '-spec.js', this);
            }
        }
    }

};