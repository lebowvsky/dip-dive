/**
 * Category enum for roles and permissions
 * Defines the main business domains in the diving management application
 */
export enum CategoryEnum {
  /**
   * Administrative category for technical management
   * Includes system administration, user management, etc.
   */
  ADMIN = 'admin',

  /**
   * Diving category for diving-related operations
   * Includes dive supervision, diver management, etc.
   */
  DIVING = 'diving',
}