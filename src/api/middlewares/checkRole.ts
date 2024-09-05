import { Request, Response, NextFunction } from "express";
import { RoleKeys, roles } from "../../config/roles";

const getPermissionsByRoleName = (roleName: string) => {
  const role = roles.roles.find((r) => r.name === roleName);
  return role ? role.permissions : [];
};

const checkPermission = (permission: RoleKeys) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.token ? req.token.role : "anonymous";
    const userPermissions = getPermissionsByRoleName(userRole);

    if (userPermissions.includes(permission)) {
      return next();
    } else {
      return res.status(403).json({ error: "Access denied" });
    }
  };
};

export default checkPermission;
