/**
 * Permission action enum for CRUD operations
 * Follows REST API conventions for granular permission control
 */
export enum PermissionActionEnum {
  /**
   * Create permission - allows creating new resources
   */
  CREATE = 'create',

  /**
   * Read permission - allows viewing/reading resources
   */
  READ = 'read',

  /**
   * Update permission - allows modifying existing resources
   */
  UPDATE = 'update',

  /**
   * Delete permission - allows removing resources
   */
  DELETE = 'delete',
}