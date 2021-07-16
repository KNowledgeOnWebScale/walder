'use strict';

const Loader = require('./loader');
const fs = require("fs");
const frontMatter = require('front-matter');

/**
 * Loads template files.
 * If template was loaded previously, it is loaded from memory.
 *
 * @type {module.TemplateLoader}
 */
module.exports = class TemplateLoader extends Loader {
    constructor() {
        super();
        this.cache = {};
    }

    /**
     * Loads template file content.
     *
     * @param htmlInfo - The information about HTML
     * @returns string - Content of the template
     */
    load(htmlInfo) {
        if (!(htmlInfo.file in this.cache)) {
            try {
                this.cache[htmlInfo.file] = frontMatter(fs.readFileSync(htmlInfo.file, 'utf8'));
            } catch
                (err) {
                const error = new Error(`Reading the file "${htmlInfo.file}" failed.`);
                error.type = 'IO_READING_FAILED';
                throw error;
            }
        }
        return this.cache[htmlInfo.file];
    }
}
;

