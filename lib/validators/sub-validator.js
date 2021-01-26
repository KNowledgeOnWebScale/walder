'use strict';

/**
 * SubValidator interface.
 *
 * validators are used to validate the configuration file input
 *
 * @type {module.SubValidator}
 */
module.exports = class SubValidator {
  constructor() {
  }

  /**
   * Validate the given input.
   *
   * @param input input to be validated.
   *        Each sub validator tests the properties of this object, if they're defined.
   *        See corresponding sub validator for specific properties.
   *
   * @returns Promise, whose resolution is: {string} validation error description (undefined if all's well)
   */
  async validate() {
  }
};
